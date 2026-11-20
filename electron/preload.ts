import { contextBridge, ipcRenderer, webUtils } from 'electron'
import type { CombineOptions } from './imageProcessor.js'

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  saveFile: (defaultPath: string) => ipcRenderer.invoke('dialog:saveFile', defaultPath),
  combineAndSave: (imagePaths: string[], outputPath: string, options: CombineOptions) =>
    ipcRenderer.invoke('image:combineAndSave', imagePaths, outputPath, options),
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  quitApp: () => ipcRenderer.invoke('app:quit'),
  getPathForFile: (file: File) => webUtils.getPathForFile(file),
})
