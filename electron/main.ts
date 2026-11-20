import { app, BrowserWindow, ipcMain, dialog, protocol, net } from 'electron'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { combineImages, type CombineOptions } from './imageProcessor.js'
import fs from 'fs/promises'
import heicConvert from 'heic-convert'

// ES Module 환경에서 __dirname 정의 (Vite 번들링 시 ReferenceError 방지)
const _dirname = path.dirname(fileURLToPath(import.meta.url))

// 중복 실행 방지
const isFirstInstance = app.requestSingleInstanceLock()

if (!isFirstInstance) {
  app.quit()
} else {
  // 커스텀 프로토콜을 표준/보안 스킴으로 등록 (app.whenReady 이전 호출 필수)
  protocol.registerSchemesAsPrivileged([
    {
      scheme: 'local-resource',
      privileges: {
        standard: true,
        secure: true,
        supportFetchAPI: true,
        bypassCSP: true,
      },
    },
  ])

  const DIST_DIR = path.join(_dirname, '../dist')
  const PUBLIC_DIR = app.isPackaged ? DIST_DIR : path.join(DIST_DIR, '../public')

  let win: BrowserWindow | null = null

  function createWindow() {
    win = new BrowserWindow({
      width: 600,
      height: 800,
      minWidth: 600,
      minHeight: 800,
      maxWidth: 600,
      maxHeight: 800,
      resizable: false,
      fullscreenable: false,
      titleBarStyle: 'hidden',
      backgroundColor: '#ffffff',
      show: false,
      ...(process.platform === 'darwin' ? { trafficLightPosition: { x: 15, y: 15 } } : {}),
      icon: path.join(PUBLIC_DIR, 'icon.png'),
      webPreferences: {
        preload: path.join(_dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
      },
    })

    win.once('ready-to-show', () => {
      win?.show()
    })

    if (!app.isPackaged) {
      win.loadURL(process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173')
    } else {
      win.loadFile(path.join(DIST_DIR, 'index.html'))
    }

    win.on('closed', () => {
      win = null
    })
  }

  app.on('second-instance', () => {
    if (win) {
      if (win.isMinimized()) win.restore()
      win.focus()
      dialog.showMessageBox(win, {
        type: 'info',
        title: '알림',
        message: '앱이 이미 실행 중입니다.',
      })
    }
  })

  app.whenReady().then(() => {
    protocol.handle('local-resource', async (request) => {
      const reqUrl = new URL(request.url)
      const filePath = reqUrl.searchParams.get('path')

      if (!filePath) {
        return new Response('Missing file path', { status: 400 })
      }

      // HEIC/HEIF 파일인 경우 브라우저가 표시할 수 있도록 JPEG로 실시간 변환
      if (/\.(heic|heif)$/i.test(filePath)) {
        try {
          const buffer = await fs.readFile(filePath)
          const convertedBuffer = await heicConvert({
            buffer,
            format: 'JPEG',
            quality: 0.8,
          })
          return new Response(new Uint8Array(convertedBuffer), {
            headers: { 'Content-Type': 'image/jpeg' },
          })
        } catch (err) {
          console.error('HEIC 프로토콜 변환 실패:', err)
          return new Response('HEIC conversion failed', { status: 500 })
        }
      }

      try {
        return await net.fetch(pathToFileURL(filePath).toString())
      } catch (err) {
        console.error('로컬 리소스 로드 실패:', err)
        return new Response('Not Found', { status: 404 })
      }
    })

    createWindow()
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })

  // IPC 핸들러
  ipcMain.handle('dialog:openFile', async () => {
    const dialogOptions: Electron.OpenDialogOptions = {
      properties: ['openFile', 'multiSelections'],
      filters: [
        {
          name: 'Images',
          extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff', 'tif', 'heic', 'heif', 'avif', 'svg'],
        },
        { name: 'All Files', extensions: ['*'] },
      ],
    }
    const result = win
      ? await dialog.showOpenDialog(win, dialogOptions)
      : await dialog.showOpenDialog(dialogOptions)
    return result.canceled ? [] : result.filePaths
  })

  ipcMain.handle('dialog:saveFile', async (_, defaultPath: string) => {
    const isPng = defaultPath.toLowerCase().endsWith('.png')
    const dialogOptions: Electron.SaveDialogOptions = {
      defaultPath,
      filters: isPng
        ? [
            { name: 'PNG Image', extensions: ['png'] },
            { name: 'JPEG Image', extensions: ['jpg', 'jpeg'] },
          ]
        : [
            { name: 'JPEG Image', extensions: ['jpg', 'jpeg'] },
            { name: 'PNG Image', extensions: ['png'] },
          ],
    }
    const result = win
      ? await dialog.showSaveDialog(win, dialogOptions)
      : await dialog.showSaveDialog(dialogOptions)
    return result.canceled || !result.filePath ? null : result.filePath
  })

  ipcMain.handle(
    'image:combineAndSave',
    async (_, imagePaths: string[], outputPath: string, options: CombineOptions) => {
      try {
        const buffer = await combineImages(imagePaths, options)
        await fs.writeFile(outputPath, buffer)
        return true
      } catch (error) {
        console.error('이미지 결합 및 저장 오류:', error)
        throw error
      }
    }
  )

  ipcMain.handle('window:minimize', () => {
    win?.minimize()
  })

  ipcMain.handle('app:quit', () => {
    app.quit()
  })
}
