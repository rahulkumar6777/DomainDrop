function createAbortError() {
  const error = new Error('Upload was cancelled')
  error.name = 'AbortError'
  return error
}

function uploadPart(url, blob, headers, onProgress, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(createAbortError())
      return
    }

    const request = new XMLHttpRequest()
    const abortUpload = () => request.abort()
    const cleanup = () => signal?.removeEventListener('abort', abortUpload)

    request.open('PUT', url)
    Object.entries(headers || {}).forEach(([name, value]) => request.setRequestHeader(name, value))
    signal?.addEventListener('abort', abortUpload, { once: true })

    request.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) onProgress(event.loaded)
    })

    request.addEventListener('load', () => {
      cleanup()
      if (request.status < 200 || request.status >= 300) {
        reject(new Error(`Object upload failed with status ${request.status}`))
        return
      }

      const etag = request.getResponseHeader('ETag')
      if (!etag) {
        reject(new Error('MinIO did not expose the ETag response header'))
        return
      }

      onProgress(blob.size)
      resolve(etag)
    })

    request.addEventListener('error', () => {
      cleanup()
      reject(new Error('Could not reach object storage'))
    })
    request.addEventListener('abort', () => {
      cleanup()
      reject(createAbortError())
    })
    request.send(blob)
  })
}

async function uploadPartBatch(parts, file, partSize, loadedParts, onProgress, signal) {
  let cursor = 0
  const workers = Array.from({ length: Math.min(4, parts.length) }, async () => {
    while (cursor < parts.length) {
      if (signal?.aborted) throw createAbortError()
      const part = parts[cursor]
      cursor += 1
      const start = (part.partNumber - 1) * partSize
      const blob = file.slice(start, Math.min(start + partSize, file.size))
      const etag = await uploadPart(part.url, blob, {}, (loaded) => {
        loadedParts.set(part.partNumber, loaded)
        const totalLoaded = [...loadedParts.values()].reduce((total, value) => total + value, 0)
        onProgress(Math.min(99, Math.round((totalLoaded / file.size) * 100)))
      }, signal)
      part.etag = etag
    }
  })

  await Promise.all(workers)
  return parts.map(({ partNumber, etag }) => ({ partNumber, etag }))
}

export async function uploadFile({ apiRequest, file, spaceId, path, onProgress, signal }) {
  const ticket = await apiRequest('/v1/files/upload-url', {
    method: 'POST',
    body: {
      spaceId,
      path,
      size: file.size,
      mimeType: file.type || 'application/octet-stream',
    },
  })

  if (signal?.aborted) throw createAbortError()
  onProgress(1)
  const completedParts = []
  const loadedParts = new Map()

  if (ticket.upload.type === 'single') {
    const etag = await uploadPart(
      ticket.upload.url,
      file,
      ticket.upload.headers,
      (loaded) => onProgress(Math.min(99, Math.round((loaded / file.size) * 99))),
      signal,
    )
    completedParts.push({ partNumber: 1, etag })
  } else {
    for (let firstPart = 1; firstPart <= ticket.upload.partCount; firstPart += 50) {
      if (signal?.aborted) throw createAbortError()
      const lastPart = Math.min(firstPart + 49, ticket.upload.partCount)
      const partNumbers = Array.from(
        { length: lastPart - firstPart + 1 },
        (_item, index) => firstPart + index,
      )
      const result = await apiRequest(`/v1/files/${ticket.file.id}/parts`, {
        method: 'POST',
        body: { partNumbers },
      })
      completedParts.push(...await uploadPartBatch(
        result.upload.parts,
        file,
        ticket.upload.partSize,
        loadedParts,
        onProgress,
        signal,
      ))
    }
  }

  if (signal?.aborted) throw createAbortError()
  const result = await apiRequest(`/v1/files/${ticket.file.id}/complete`, {
    method: 'POST',
    body: { parts: completedParts },
  })
  onProgress(100)
  return result.file
}
