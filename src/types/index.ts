export interface ImageItem {
  id: string
  path: string
  thumbnail: string
  width: number
  height: number
}

export interface ExportOptions {
  format: 'jpg' | 'png'
  quality: number
  targetWidth?: number
}

export interface ZoomLevel {
  type: 'custom' | 'fit-width' | 'fit-height' | '100%'
  scale: number
}

declare global {
  interface Window {
    electronAPI: {
      platform: string
      openFile: () => Promise<string[]>
      saveFile: (defaultPath: string) => Promise<string | null>
      combineAndSave: (imagePaths: string[], outputPath: string, options: ExportOptions) => Promise<boolean>
      minimizeWindow: () => Promise<void>
      quitApp: () => Promise<void>
      getPathForFile: (file: File) => string
    }
  }
}
