export const apiKeyScopes = [
  ['files:read', 'Read file metadata and delivery URLs'],
  ['files:write', 'Upload and delete files'],
  ['spaces:read', 'List spaces'],
  ['spaces:write', 'Create, edit, and delete spaces'],
  ['storage:read', 'Read bucket usage and policy'],
  ['policy:write', 'Change bucket visibility'],
  ['cors:write', 'Change bucket browser origins'],
]

export const allApiKeyScopes = apiKeyScopes.map(([scope]) => scope)
