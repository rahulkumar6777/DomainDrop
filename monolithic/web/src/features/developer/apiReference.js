const json = (value) => JSON.stringify(value, null, 2)

const fileResponse = json({
  success: true,
  file: {
    id: '66c4...a91',
    spaceId: '66c4...713',
    path: 'reports/august.pdf',
    originalName: 'august.pdf',
    mimeType: 'application/pdf',
    size: 24831,
    status: 'ready',
    uploadedAt: '2026-08-20T10:20:00.000Z',
  },
})

export const apiReference = {
  auth: {
    eyebrow: 'API reference',
    title: 'Authentication',
    copy: 'Create an account session for the web dashboard. Server integrations should use API keys instead.',
    endpoints: [
      {
        method: 'POST', path: '/api/v1/auth/register/init', auth: 'Public', summary: 'Start registration',
        description: 'Creates a pending account and sends a six-digit verification code.',
        request: json({ fullName: 'Rahul Sharma', email: 'rahul@example.com', password: 'Strong@123' }),
        response: json({ success: true, message: 'Otp sent Successfully' }),
      },
      {
        method: 'POST', path: '/api/v1/auth/register/verify', auth: 'Public', summary: 'Verify registration',
        description: 'Verifies the email code, provisions the user bucket, and creates the default space.',
        request: json({ email: 'rahul@example.com', otp: '123456' }),
        response: json({ success: true, message: 'Registration Verified SuccessFully' }),
      },
      {
        method: 'POST', path: '/api/v1/auth/login', auth: 'Public', summary: 'Create a session',
        description: 'Returns a short-lived access token and sets the rotating HttpOnly refresh cookie.',
        request: json({ email: 'rahul@example.com', password: 'Strong@123' }),
        response: json({ success: true, message: 'Login Successful', AccessToken: '<JWT>' }),
      },
      {
        method: 'GET', path: '/api/v1/auth/refresh-token', auth: 'Refresh cookie', summary: 'Rotate the session',
        description: 'Uses the HttpOnly refresh cookie and returns a new access token.',
        response: json({ accessToken: '<JWT>' }),
      },
      {
        method: 'POST', path: '/api/v1/auth/logout', auth: 'Refresh cookie', summary: 'End the session',
        description: 'Revokes the current Redis session and clears the refresh cookie.',
        response: json({ success: true, message: 'Logged out successfully' }),
      },
    ],
  },
  spaces: {
    eyebrow: 'API reference',
    title: 'Spaces',
    copy: 'Spaces are logical separators inside the user bucket. They are not physical MinIO folders.',
    endpoints: [
      {
        method: 'POST', path: '/api/v1/spaces', scope: 'spaces:write', summary: 'Create a space',
        description: 'Creates a named separator with its own internal object-key prefix.',
        request: json({ name: 'production', description: 'Production uploads' }),
        response: json({ success: true, space: { id: '66c4...713', name: 'production', description: 'Production uploads', isDefault: false } }),
      },
      {
        method: 'GET', path: '/api/v1/spaces', scope: 'spaces:read', summary: 'List spaces',
        description: 'Returns the default space first, followed by custom spaces sorted by name.',
        response: json({ success: true, spaces: [{ id: '66c4...101', name: 'default', isDefault: true }] }),
      },
      {
        method: 'GET', path: '/api/v1/spaces/:spaceId', scope: 'spaces:read', summary: 'Get one space',
        description: 'Returns one space owned by the authenticated user.',
        response: json({ success: true, space: { id: '66c4...713', name: 'production', isDefault: false } }),
      },
      {
        method: 'PATCH', path: '/api/v1/spaces/:spaceId', scope: 'spaces:write', summary: 'Update a space',
        description: 'Updates a custom space. The default space cannot be renamed.',
        request: json({ name: 'production-media', description: 'Public product media' }),
        response: json({ success: true, space: { id: '66c4...713', name: 'production-media', isDefault: false } }),
      },
      {
        method: 'DELETE', path: '/api/v1/spaces/:spaceId', scope: 'spaces:write', summary: 'Delete a space',
        description: 'Deletes an empty custom space. The default space and non-empty spaces are protected.',
        response: json({ success: true, message: 'Space deleted successfully', spaceId: '66c4...713' }),
      },
    ],
  },
  files: {
    eyebrow: 'API reference',
    title: 'Files',
    copy: 'Create signed upload plans, complete objects, list metadata, and obtain delivery URLs.',
    endpoints: [
      {
        method: 'POST', path: '/api/v1/files/upload-url', scope: 'files:write', summary: 'Create an upload plan',
        description: 'Reserves quota and returns either one signed PUT URL or a multipart plan.',
        request: json({ spaceId: '66c4...713', path: 'reports/august.pdf', size: 24831, mimeType: 'application/pdf' }),
        response: json({ success: true, file: { id: '66c4...a91', status: 'pending' }, upload: { type: 'single', method: 'PUT', url: '<SIGNED_MINIO_URL>', headers: { 'Content-Type': 'application/pdf' }, partNumber: 1 } }),
      },
      {
        method: 'POST', path: '/api/v1/files/:fileId/parts', scope: 'files:write', summary: 'Sign multipart parts',
        description: 'Signs up to 50 requested part numbers for a pending multipart upload.',
        request: json({ partNumbers: [1, 2, 3] }),
        response: json({ success: true, upload: { parts: [{ partNumber: 1, method: 'PUT', url: '<SIGNED_PART_URL>' }], etagHeader: 'ETag' } }),
      },
      {
        method: 'POST', path: '/api/v1/files/:fileId/complete', scope: 'files:write', summary: 'Complete an upload',
        description: 'Commits uploaded parts, verifies final object size, and moves reserved quota into usage.',
        request: json({ parts: [{ partNumber: 1, etag: '"9a0364..."' }] }),
        response: fileResponse,
      },
      {
        method: 'GET', path: '/api/v1/files', scope: 'files:read', summary: 'List files',
        description: 'Supports spaceId, prefix, status, and limit query parameters. Limit is capped at 100.',
        response: json({ success: true, files: [{ id: '66c4...a91', spaceId: '66c4...713', path: 'reports/august.pdf', size: 24831, status: 'ready' }] }),
      },
      {
        method: 'GET', path: '/api/v1/files/:fileId', scope: 'files:read', summary: 'Get file metadata',
        description: 'Returns metadata for one owned file. Object bytes are delivered by MinIO, not this route.',
        response: fileResponse,
      },
      {
        method: 'POST', path: '/api/v1/files/:fileId/signed-url', scope: 'files:read', summary: 'Create a delivery URL',
        description: 'Returns a signed URL for private buckets or the stable CDN URL for public-read buckets.',
        request: json({ expiresIn: 900 }),
        response: json({ success: true, download: { url: '<DELIVERY_URL>', type: 'signed', expiresAt: '2026-08-20T10:35:00.000Z' } }),
      },
      {
        method: 'DELETE', path: '/api/v1/files/:fileId', scope: 'files:write', summary: 'Delete a file',
        description: 'Claims deletion idempotently, removes the MinIO object, and releases used or reserved quota.',
        response: json({ success: true, message: 'File deleted', fileId: '66c4...a91' }),
      },
    ],
  },
  storage: {
    eyebrow: 'API reference',
    title: 'Storage',
    copy: 'Inspect the one user bucket, quota counters, delivery policy, and browser access rules.',
    endpoints: [
      {
        method: 'GET', path: '/api/v1/storage', scope: 'storage:read', summary: 'Get storage state',
        description: 'Returns bucket identity, policy, CORS state, usage, quota, and provisioning status.',
        response: json({ success: true, storage: { bucket: { name: 'dd-user-...', provider: 'minio' }, policy: { visibility: 'private', appliedVisibility: 'private', status: 'applied' }, cors: { defaultOrigin: 'https://app.domaindrop.cloud', configuration: { allowedOrigins: ['https://app.example.com'], allowedMethods: ['GET', 'HEAD', 'PUT'], allowedHeaders: ['*'], exposeHeaders: ['ETag'], maxAgeSeconds: 3600 }, status: 'applied' }, usage: { objects: 12, bytes: 829301 }, quota: { maxBytes: 1073741824, maxObjects: 200, maxFileSize: 104857600 }, status: 'active' } }),
      },
      {
        method: 'PATCH', path: '/api/v1/storage/policy', scope: 'policy:write', summary: 'Update bucket visibility',
        description: 'Applies private or public-read to the whole MinIO bucket. Every space and file inherits it.',
        request: json({ visibility: 'public-read' }),
        response: json({ success: true, policy: { visibility: 'public-read', appliedVisibility: 'public-read', status: 'applied', appliedAt: '2026-08-20T10:20:00.000Z' } }),
      },
      {
        method: 'PUT', path: '/api/v1/storage/cors', scope: 'cors:write', summary: 'Replace custom CORS rules',
        description: 'Applies these origins to the user bucket. The DomainDrop dashboard origin remains present automatically.',
        request: json({ allowedOrigins: ['https://app.example.com', 'https://*.preview.example.com'], allowedMethods: ['GET', 'HEAD', 'PUT'], allowedHeaders: ['*'], exposeHeaders: ['ETag'], maxAgeSeconds: 3600 }),
        response: json({ success: true, cors: { defaultOrigin: 'https://app.domaindrop.cloud', configuration: { allowedOrigins: ['https://app.example.com', 'https://*.preview.example.com'], allowedMethods: ['GET', 'HEAD', 'PUT'], allowedHeaders: ['*'], exposeHeaders: ['ETag'], maxAgeSeconds: 3600 }, appliedConfiguration: { allowedOrigins: ['https://app.example.com', 'https://*.preview.example.com'], allowedMethods: ['GET', 'HEAD', 'PUT'], allowedHeaders: ['*'], exposeHeaders: ['ETag'], maxAgeSeconds: 3600 }, status: 'applied', appliedAt: '2026-08-20T10:20:00.000Z' } }),
      },
    ],
  },
  'api-keys': {
    eyebrow: 'API reference',
    title: 'API keys',
    copy: 'Manage server credentials from an authenticated account session. Raw keys are returned once.',
    endpoints: [
      {
        method: 'POST', path: '/api/v1/api-keys', auth: 'Bearer session only', summary: 'Create an API key',
        description: 'Creates a scoped key and returns its raw value once. Store only that raw value in your server environment.',
        request: json({ apiKeyName: 'Production server', apiKeyScope: ['files:read', 'files:write', 'spaces:read'], expiresAt: null }),
        response: json({ success: true, apiKey: 'dd_live_...', key: { id: '66c4...b12', name: 'Production server', keyPrefix: 'dd_live_abcd...', scopes: ['files:read', 'files:write', 'spaces:read'], status: 'active' } }),
      },
      {
        method: 'GET', path: '/api/v1/api-keys', auth: 'Bearer session only', summary: 'List API keys',
        description: 'Lists safe metadata and prefixes. Full raw keys are never returned again.',
        response: json({ success: true, keys: [{ id: '66c4...b12', name: 'Production server', keyPrefix: 'dd_live_abcd...', status: 'active', scopes: ['files:read'] }] }),
      },
      {
        method: 'DELETE', path: '/api/v1/api-keys/:apiKeyId', auth: 'Bearer session only', summary: 'Revoke an API key',
        description: 'Marks the key revoked and invalidates its Redis authentication cache.',
        response: json({ success: true, message: 'API key revoked', apiKeyId: '66c4...b12' }),
      },
    ],
  },
}
