export const IMAGE_FILE_REGEX = /\.(jpe?g|png|gif|webp|bmp|tiff?|heic|heif|avif|svg)$/i

export function toLocalResourceUrl(filePath: string): string {
  return `local-resource://asset/?path=${encodeURIComponent(filePath)}`
}

export function extractDroppedImagePaths(fileList: FileList): string[] {
  const api = window.electronAPI
  if (!api) return []

  return Array.from(fileList)
    .filter((file) => IMAGE_FILE_REGEX.test(file.name))
    .map((file) => api.getPathForFile(file))
    .filter((filePath) => Boolean(filePath))
}

export function formatLocalTimestamp(date: Date = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, '0')
  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())
  const seconds = pad(date.getSeconds())
  return `${year}${month}${day}_${hours}${minutes}${seconds}`
}

export function extractIpcErrorMessage(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error ?? '')
  const cleaned = raw.replace(/^Error invoking remote method '[^']+':\s*(?:Error:\s*)?/, '').trim()
  return cleaned || '알 수 없는 오류가 발생했습니다.'
}

export function getFileName(filePath: string): string {
  const parts = filePath.split(/[/\\]/)
  return parts[parts.length - 1] || filePath
}
