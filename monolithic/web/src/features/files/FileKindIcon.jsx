import { File, FileImage, FileText } from 'lucide-react'

function FileKindIcon({ mimeType, size = 17 }) {
  const Icon = mimeType?.startsWith('image/')
    ? FileImage
    : mimeType?.includes('text') || mimeType?.includes('pdf')
      ? FileText
      : File

  return <Icon size={size} />
}

export default FileKindIcon
