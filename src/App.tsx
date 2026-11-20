import { useState, useEffect } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import Preview from './components/Preview'
import SlotList from './components/SlotList'
import ExportDialog from './components/ExportDialog'
import SponsorDialog from './components/SponsorDialog'
import { useImageList } from './hooks/useImageList'
import type { ExportOptions } from './types'
import {
  extractDroppedImagePaths,
  extractIpcErrorMessage,
  formatLocalTimestamp,
} from './utils/imageFiles'
import './styles/global.css'

function App() {
  const { images, addImages, removeImage, reorderImages, replaceImage, resetImages } = useImageList()
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showSponsorDialog, setShowSponsorDialog] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // 전역 드래그 앤 드롭 기본 동작 방지 (파일이 브라우저 탭으로 열리거나 다운로드되는 현상 방지)
  useEffect(() => {
    const preventDefault = (e: DragEvent) => {
      e.preventDefault()
    }
    window.addEventListener('dragover', preventDefault)
    window.addEventListener('drop', preventDefault)
    return () => {
      window.removeEventListener('dragover', preventDefault)
      window.removeEventListener('drop', preventDefault)
    }
  }, [])

  const handleExport = () => {
    if (images.length === 0) return
    setShowExportDialog(true)
  }

  const handleReset = () => {
    if (confirm('모든 이미지를 삭제하고 새로 시작하시겠습니까?')) {
      resetImages()
      setSelectedId(null)
    }
  }

  const handleBackgroundClick = () => {
    // 하위에서 stopPropagation()이 호출되지 않은 모든 클릭은 선택 해제로 간주
    setSelectedId(null)
  }

  const handleExportConfirm = async (options: ExportOptions) => {
    setShowExportDialog(false)
    setIsExporting(true)

    try {
      const timestamp = formatLocalTimestamp()
      const extension = options.format === 'jpg' ? 'jpg' : 'png'
      const defaultPath = `combined_${timestamp}.${extension}`

      const savePath = await window.electronAPI.saveFile(defaultPath)
      if (!savePath) {
        return
      }

      // 사용자가 선택한 파일 경로의 확장자에 맞춰 이미지 포맷 자동 변경
      const finalOptions: ExportOptions = { ...options }
      const lowerSavePath = savePath.toLowerCase()
      if (lowerSavePath.endsWith('.png')) {
        finalOptions.format = 'png'
      } else if (lowerSavePath.endsWith('.jpg') || lowerSavePath.endsWith('.jpeg')) {
        finalOptions.format = 'jpg'
      }

      const imagePaths = images.map((img) => img.path)
      await window.electronAPI.combineAndSave(imagePaths, savePath, finalOptions)

      alert('이미지가 성공적으로 저장되었습니다!')
    } catch (error) {
      console.error('내보내기 오류:', error)
      alert(`이미지 저장 중 오류가 발생했습니다.\n${extractIpcErrorMessage(error)}`)
    } finally {
      setIsExporting(false)
    }
  }

  const handleQuit = () => {
    if (confirm('앱을 종료하시겠습니까?')) {
      window.electronAPI.quitApp()
    }
  }

  return (
    <div style={styles.app} onClick={handleBackgroundClick}>
      <Header
        onExport={handleExport}
        onReset={handleReset}
        onSponsor={() => setShowSponsorDialog(true)}
        onMinimize={() => window.electronAPI?.minimizeWindow()}
        onQuit={handleQuit}
        hasImages={images.length > 0}
      />

      <div style={styles.main}>
        <div
          style={{
            ...styles.previewPanel,
            backgroundColor: isDragOver ? 'rgba(0, 122, 255, 0.05)' : 'transparent',
            outline: isDragOver ? '2px dashed #007aff' : 'none',
            outlineOffset: '-4px',
          }}
          onDragOver={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setIsDragOver(true)
          }}
          onDragLeave={(e) => {
            if (e.currentTarget.contains(e.relatedTarget as Node | null)) return
            setIsDragOver(false)
          }}
          onDrop={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setIsDragOver(false)

            const imagePaths = extractDroppedImagePaths(e.dataTransfer.files)
            if (imagePaths.length > 0) {
              addImages(imagePaths)
            }
          }}
        >
          <Preview images={images} selectedId={selectedId} onSelect={setSelectedId} />
        </div>

        <div style={styles.slotPanel}>
          <SlotList
            images={images}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onAddImages={addImages}
            onRemoveImage={(id) => {
              removeImage(id)
              if (selectedId === id) setSelectedId(null)
            }}
            onReorderImages={reorderImages}
            onReplaceImage={replaceImage}
          />
        </div>
      </div>

      <Footer />

      {showExportDialog && (
        <ExportDialog
          images={images}
          onConfirm={handleExportConfirm}
          onCancel={() => setShowExportDialog(false)}
        />
      )}

      {showSponsorDialog && (
        <SponsorDialog onClose={() => setShowSponsorDialog(false)} />
      )}

      {isExporting && (
        <div style={styles.loadingOverlay}>
          <div style={styles.spinner} />
          <p style={styles.loadingText}>이미지 저장 중...</p>
        </div>
      )}
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  app: {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  main: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
  },
  previewPanel: {
    flex: '1',
    minWidth: 0,
    borderRight: '1px solid #e9ecef',
    overflow: 'hidden',
  },
  slotPanel: {
    width: '200px',
    flexShrink: 0,
    overflow: 'hidden',
  },
  loadingOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid rgba(255, 255, 255, 0.3)',
    borderTop: '4px solid #ffffff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    marginTop: '16px',
    fontSize: '16px',
    color: '#ffffff',
    fontWeight: '500',
  },
}

export default App
