import React, { useState, useEffect, useMemo, useRef } from 'react'
import type { ExportOptions, ImageItem } from '../types'

interface ExportDialogProps {
  images: ImageItem[]
  onConfirm: (options: ExportOptions) => void
  onCancel: () => void
}

const JPEG_MAX_DIMENSION = 65500

const ExportDialog: React.FC<ExportDialogProps> = ({ images, onConfirm, onCancel }) => {
  const [format, setFormat] = useState<'jpg' | 'png'>('jpg')
  const [quality, setQuality] = useState(90)

  const originalMaxWidth = images.length > 0
    ? Math.max(...images.map((img) => img.width))
    : 1080
  const [targetWidthInput, setTargetWidthInput] = useState(String(originalMaxWidth))
  const isOverlayMouseDownRef = useRef(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onCancel])

  const parsedWidth = Number.parseInt(targetWidthInput, 10)
  const isValidWidth = Number.isFinite(parsedWidth) && parsedWidth > 0

  const estimatedHeight = useMemo(() => {
    if (!isValidWidth || images.length === 0) return 0
    return images.reduce((sum, img) => {
      const scale = parsedWidth / img.width
      return sum + Math.max(1, Math.round(img.height * scale))
    }, 0)
  }, [images, parsedWidth, isValidWidth])

  const exceedsJpegLimit =
    format === 'jpg' &&
    isValidWidth &&
    (parsedWidth > JPEG_MAX_DIMENSION || estimatedHeight > JPEG_MAX_DIMENSION)

  const handleConfirm = () => {
    if (!isValidWidth || exceedsJpegLimit) return
    onConfirm({ format, quality, targetWidth: parsedWidth })
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    isOverlayMouseDownRef.current = e.target === e.currentTarget
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && isOverlayMouseDownRef.current) {
      onCancel()
    }
    isOverlayMouseDownRef.current = false
  }

  return (
    <div
      style={styles.overlay}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <div
        style={styles.dialog}
        onMouseDown={(e) => e.stopPropagation()}
        onMouseUp={(e) => e.stopPropagation()}
      >
        <h2 style={styles.title}>이미지 내보내기</h2>

        <div style={styles.formGroup}>
          <label style={styles.label}>가로 너비 (pixel)</label>
          <input
            type="number"
            min="1"
            value={targetWidthInput}
            onChange={(e) => setTargetWidthInput(e.target.value)}
            onBlur={() => {
              if (!isValidWidth) {
                setTargetWidthInput(String(originalMaxWidth))
              } else {
                setTargetWidthInput(String(parsedWidth))
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                (e.target as HTMLInputElement).blur()
              }
            }}
            style={styles.input}
            placeholder="예: 1080"
          />
          <p style={styles.hintText}>
            * 원본 최대 너비: {originalMaxWidth.toLocaleString()}px
            {isValidWidth && estimatedHeight > 0
              ? ` · 예상 결과 크기: ${parsedWidth.toLocaleString()} × ${estimatedHeight.toLocaleString()}px`
              : ''}
          </p>
          {exceedsJpegLimit && (
            <p style={styles.warningText}>
              JPEG 형식은 최대 65,500px까지 지원합니다. 가로 너비를 줄이거나 PNG 형식으로 저장해 주세요.
            </p>
          )}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>파일 형식</label>
          <div style={styles.radioGroup}>
            <label style={styles.radioLabel}>
              <input
                type="radio"
                value="jpg"
                checked={format === 'jpg'}
                onChange={(e) => setFormat(e.target.value as 'jpg')}
                style={styles.radio}
              />
              <span>JPEG (.jpg)</span>
            </label>
            <label style={styles.radioLabel}>
              <input
                type="radio"
                value="png"
                checked={format === 'png'}
                onChange={(e) => setFormat(e.target.value as 'png')}
                style={styles.radio}
              />
              <span>PNG (.png)</span>
            </label>
          </div>
        </div>

        {format === 'jpg' && (
          <div style={styles.formGroup}>
            <label style={styles.label}>
              품질 (1-100): <strong>{quality}</strong>
            </label>
            <input
              type="range"
              min="1"
              max="100"
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              style={styles.slider}
            />
            <div style={styles.qualityHints}>
              <span style={styles.hint}>낮음 (작은 용량)</span>
              <span style={styles.hint}>높음 (큰 용량)</span>
            </div>
          </div>
        )}

        <div style={styles.buttonGroup}>
          <button type="button" style={styles.cancelButton} onClick={onCancel}>
            취소
          </button>
          <button
            type="button"
            style={styles.confirmButton}
            onClick={handleConfirm}
            disabled={!isValidWidth || exceedsJpegLimit}
          >
            내보내기
          </button>
        </div>
      </div>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    userSelect: 'none',
  },
  dialog: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    width: '90%',
    maxWidth: '400px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    overflow: 'hidden',
  },
  title: {
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '24px',
    color: '#212529',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '8px',
    color: '#495057',
  },
  radioGroup: {
    display: 'flex',
    gap: '16px',
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '14px',
    cursor: 'pointer',
    color: '#212529',
  },
  radio: {
    cursor: 'pointer',
  },
  slider: {
    width: '100%',
    height: '6px',
    cursor: 'pointer',
  },
  qualityHints: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '4px',
  },
  hint: {
    fontSize: '12px',
    color: '#6c757d',
  },
  hintText: {
    fontSize: '11px',
    color: '#868e96',
    marginTop: '6px',
  },
  warningText: {
    fontSize: '11px',
    color: '#e03131',
    marginTop: '6px',
    lineHeight: 1.4,
  },
  input: {
    width: '100%',
    padding: '8px 12px',
    fontSize: '14px',
    borderRadius: '6px',
    border: '1px solid #dee2e6',
    boxSizing: 'border-box',
    outline: 'none',
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    marginTop: '24px',
  },
  cancelButton: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#f1f3f5',
    border: '1px solid #dee2e6',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#495057',
  },
  confirmButton: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#4a90e2',
    border: '1px solid #4a90e2',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#ffffff',
  },
}

export default ExportDialog
