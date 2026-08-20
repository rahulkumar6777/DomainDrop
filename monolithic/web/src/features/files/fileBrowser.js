const getFileDate = (file) => file.uploadedAt || file.updatedAt || file.createdAt || null

const getTime = (value) => {
  const time = value ? new Date(value).getTime() : 0
  return Number.isFinite(time) ? time : 0
}

const getLatestDate = (current, candidate) => (
  getTime(candidate) > getTime(current) ? candidate : current
)

export const normalizeDirectoryPath = (path = '') => String(path)
  .split('/')
  .filter(Boolean)
  .join('/')

export const joinDirectoryPath = (...parts) => parts
  .map(normalizeDirectoryPath)
  .filter(Boolean)
  .join('/')

export const getParentDirectory = (path = '') => {
  const segments = normalizeDirectoryPath(path).split('/').filter(Boolean)
  return segments.slice(0, -1).join('/')
}

export const getPathSegments = (path = '') => {
  const segments = normalizeDirectoryPath(path).split('/').filter(Boolean)
  return segments.map((name, index) => ({
    name,
    path: segments.slice(0, index + 1).join('/'),
  }))
}

export const buildSpaceEntries = (spaces, files) => {
  const summaries = new Map(spaces.map((space) => [String(space.id), {
    ...space,
    fileCount: 0,
    size: 0,
    updatedAt: null,
  }]))

  files.forEach((file) => {
    const space = summaries.get(String(file.spaceId))
    if (!space) return

    space.fileCount += 1
    space.size += Number.isFinite(file.size) ? file.size : 0
    space.updatedAt = getLatestDate(space.updatedAt, getFileDate(file))
  })

  return Array.from(summaries.values()).sort((left, right) => {
    if (left.isDefault !== right.isDefault) return left.isDefault ? -1 : 1
    return left.name.localeCompare(right.name)
  })
}

export const buildDirectoryEntries = (files, spaceId, directoryPath = '') => {
  const directory = normalizeDirectoryPath(directoryPath)
  const prefix = directory ? `${directory}/` : ''
  const folders = new Map()
  const directFiles = []

  files.forEach((file) => {
    if (String(file.spaceId) !== String(spaceId)) return

    const filePath = normalizeDirectoryPath(file.path)
    if (!filePath.startsWith(prefix)) return

    const relativePath = filePath.slice(prefix.length)
    if (!relativePath) return

    const separatorIndex = relativePath.indexOf('/')
    if (separatorIndex === -1) {
      directFiles.push(file)
      return
    }

    const name = relativePath.slice(0, separatorIndex)
    const existingFolder = folders.get(name) || {
      name,
      path: joinDirectoryPath(directory, name),
      fileCount: 0,
      size: 0,
      updatedAt: null,
    }

    existingFolder.fileCount += 1
    existingFolder.size += Number.isFinite(file.size) ? file.size : 0
    existingFolder.updatedAt = getLatestDate(existingFolder.updatedAt, getFileDate(file))
    folders.set(name, existingFolder)
  })

  return {
    folders: Array.from(folders.values()).sort((left, right) => left.name.localeCompare(right.name)),
    files: directFiles.sort((left, right) => left.originalName.localeCompare(right.originalName)),
  }
}
