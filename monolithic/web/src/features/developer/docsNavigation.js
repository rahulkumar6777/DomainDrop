export const docsNavigation = [
  {
    label: 'Start',
    items: [
      { label: 'Overview', to: '/developer', end: true },
      { label: 'Quickstart', to: '/developer/quickstart' },
      { label: 'Authentication', to: '/developer/authentication' },
    ],
  },
  {
    label: 'Guides',
    items: [
      { label: 'Upload files', to: '/developer/guides/upload-files' },
      { label: 'File delivery', to: '/developer/guides/file-delivery' },
    ],
  },
  {
    label: 'API reference',
    items: [
      { label: 'Auth', to: '/developer/api/auth' },
      { label: 'Spaces', to: '/developer/api/spaces' },
      { label: 'Files', to: '/developer/api/files' },
      { label: 'Storage', to: '/developer/api/storage' },
      { label: 'API keys', to: '/developer/api/api-keys' },
    ],
  },
  {
    label: 'SDK',
    items: [
      { label: 'Node.js package', to: '/developer/sdk/node' },
    ],
  },
  {
    label: 'REST examples',
    items: [
      { label: 'Node.js', to: '/developer/examples/node' },
      { label: 'Java', to: '/developer/examples/java' },
      { label: 'Go', to: '/developer/examples/go' },
      { label: 'Python', to: '/developer/examples/python' },
      { label: 'Rust', to: '/developer/examples/rust' },
      { label: 'cURL', to: '/developer/examples/curl' },
    ],
  },
]

export const flatDocsNavigation = docsNavigation.flatMap((group) => group.items)
