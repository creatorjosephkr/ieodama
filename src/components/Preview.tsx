import React, { useState, useEffect, useRef, useCallback } from 'react'
import type { ImageItem, ZoomLevel } from '../types'

interface PreviewProps {
  images: ImageItem[]
  selectedId: string | null
  onSelect: (id: string | null) => void
}

function calculateFitScale(
  container: HTMLDivElement,
  images: ImageItem[],
  fitType: 'fit-width' | 'fit-height'
): number | null {
  if (images.length === 0) return null

  const containerWidth = container.clientWidth - 40
  const containerHeight = container.clientHeight - 40
  if (containerWidth <= 0 || containerHeight <= 0) return null

  const maxWidth = Math.max(...images.map((img) => img.width))
  if (maxWidth <= 0) return null

  if (fitType === 'fit-width') {
    return containerWidth / maxWidth
  }

  const totalHeight = images.reduce((sum, img) => {
    const scale = maxWidth / img.width
    return sum + img.height * scale
  }, 0)

  if (totalHeight <= 0) return null
  return containerHeight / totalHeight
}

const Preview: React.FC<PreviewProps> = ({ images, selectedId, onSelect }) => {
  const [zoom, setZoom] = useState<ZoomLevel>({ type: 'fit-width', scale: 1 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [scrollStart, setScrollStart] = useState({ left: 0, top: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRefs = useRef<{ [key: string]: HTMLImageElement | null }>({})
  const didDragRef = useRef(false)

  // 선택된 이미지로 스크롤 이동
  useEffect(() => {
    if (!selectedId) return
    const targetImg = imageRefs.current[selectedId]
    if (targetImg) {
      targetImg.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }, [selectedId])

  const applyFitScale = useCallback(
    (fitType: 'fit-width' | 'fit-height') => {
      const container = containerRef.current
      if (!container) return

      const nextScale = calculateFitScale(container, images, fitType)
      if (nextScale === null) return

      setZoom((prev) => {
        if (prev.type === fitType && Math.abs(prev.scale - nextScale) <= 0.005) {
          return prev
        }
        return { type: fitType, scale: nextScale }
      })
    },
    [images]
  )

  // 이미지 목록 또는 컨테이너 크기 변경 시 Fit 모드 배율 재계산
  useEffect(() => {
    if (zoom.type !== 'fit-width' && zoom.type !== 'fit-height') return
    const fitType = zoom.type
    applyFitScale(fitType)

    const container = containerRef.current
    if (!container) return

    const observer = new ResizeObserver(() => {
      applyFitScale(fitType)
    })
    observer.observe(container)
    return () => observer.disconnect()
  }, [zoom.type, applyFitScale])

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (didDragRef.current) {
      e.stopPropagation()
      return
    }
    if (e.target === e.currentTarget) {
      onSelect(null)
    }
  }

  const handleZoomIn = () => {
    setZoom((prev) => ({ type: 'custom', scale: Math.min(prev.scale * 1.1, 5) }))
  }

  const handleZoomOut = () => {
    setZoom((prev) => ({ type: 'custom', scale: Math.max(prev.scale * 0.9, 0.1) }))
  }

  const handle100 = () => {
    setZoom({ type: '100%', scale: 1 })
  }

  const handleFitWidth = () => {
    const nextScale = containerRef.current
      ? calculateFitScale(containerRef.current, images, 'fit-width')
      : null
    setZoom({ type: 'fit-width', scale: nextScale ?? 1 })
  }

  const handleFitHeight = () => {
    const nextScale = containerRef.current
      ? calculateFitScale(containerRef.current, images, 'fit-height')
      : null
    setZoom({ type: 'fit-height', scale: nextScale ?? 1 })
  }

  // 마우스 드래그 패닝
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return
    didDragRef.current = false
    setIsDragging(true)
    setDragStart({ x: e.pageX, y: e.pageY })
    setScrollStart({
      left: containerRef.current.scrollLeft,
      top: containerRef.current.scrollTop,
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return
    e.preventDefault()
    const dx = e.pageX - dragStart.x
    const dy = e.pageY - dragStart.y
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      didDragRef.current = true
    }
    containerRef.current.scrollLeft = scrollStart.left - dx
    containerRef.current.scrollTop = scrollStart.top - dy
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const maxWidth = images.length > 0 ? Math.max(...images.map((img) => img.width)) : 0

  return (
    <div style={styles.container}>
      <div style={styles.controls}>
        <button type="button" style={styles.controlButton} onClick={handleZoomIn} title="확대">
          <ZoomInIcon />
        </button>
        <button type="button" style={styles.controlButton} onClick={handleZoomOut} title="축소">
          <ZoomOutIcon />
        </button>
        <button
          type="button"
          style={{
            ...styles.controlButton,
            ...styles.textButton,
            ...(zoom.type === '100%' ? styles.activeButton : {}),
          }}
          onClick={handle100}
          title="실제 크기"
        >
          100%
        </button>
        <button
          type="button"
          style={{
            ...styles.controlButton,
            ...styles.textButton,
            ...(zoom.type === 'fit-width' ? styles.activeButton : {}),
          }}
          onClick={handleFitWidth}
          title="가로 맞춤"
        >
          가로 Fit
        </button>
        <button
          type="button"
          style={{
            ...styles.controlButton,
            ...styles.textButton,
            ...(zoom.type === 'fit-height' ? styles.activeButton : {}),
          }}
          onClick={handleFitHeight}
          title="세로 맞춤"
        >
          세로 Fit
        </button>
        <span style={styles.zoomInfo}>{Math.round(zoom.scale * 100)}%</span>
      </div>

      <div
        ref={containerRef}
        style={{
          ...styles.previewContainer,
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleBackgroundClick}
      >
        {images.length === 0 ? (
          <div style={styles.emptyState} onClick={handleBackgroundClick}>
            <EmptyIcon />
            <p style={styles.emptyText}>이미지를 추가하면 여기에 미리보기가 표시됩니다</p>
          </div>
        ) : (
          <div style={styles.imageStack} onClick={handleBackgroundClick}>
            {images.map((img, index) => {
              const scale = img.width > 0 ? (maxWidth / img.width) * zoom.scale : zoom.scale
              const displayWidth = img.width * scale
              const displayHeight = img.height * scale

              return (
                <img
                  key={img.id}
                  ref={(el) => {
                    if (el) {
                      imageRefs.current[img.id] = el
                    } else {
                      delete imageRefs.current[img.id]
                    }
                  }}
                  src={img.thumbnail}
                  alt={`Image ${index + 1}`}
                  draggable={false}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (!didDragRef.current) {
                      onSelect(img.id)
                    }
                  }}
                  style={{
                    width: `${displayWidth}px`,
                    height: `${displayHeight}px`,
                    display: 'block',
                    boxSizing: 'border-box',
                    border: selectedId === img.id ? '4px solid #007aff' : 'none',
                    transition: 'border 0.2s ease',
                  }}
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

const ZoomInIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <circle cx="11" cy="11" r="8" strokeWidth="2"/>
    <path d="m21 21-4.35-4.35" strokeWidth="2" strokeLinecap="round"/>
    <line x1="11" y1="8" x2="11" y2="14" strokeWidth="2" strokeLinecap="round"/>
    <line x1="8" y1="11" x2="14" y2="11" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

const ZoomOutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <circle cx="11" cy="11" r="8" strokeWidth="2"/>
    <path d="m21 21-4.35-4.35" strokeWidth="2" strokeLinecap="round"/>
    <line x1="8" y1="11" x2="14" y2="11" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

const EmptyIcon = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#dee2e6">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeWidth="2"/>
    <circle cx="8.5" cy="8.5" r="1.5" fill="#dee2e6"/>
    <polyline points="21 15 16 10 5 21" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#ffffff',
  },
  controls: {
    height: '50px',
    borderBottom: '1px solid #e9ecef',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '0 20px',
  },
  controlButton: {
    width: '36px',
    height: '36px',
    backgroundColor: '#f1f3f5',
    border: '1px solid #dee2e6',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#495057',
  },
  textButton: {
    width: 'auto',
    padding: '0 12px',
    fontSize: '13px',
    fontWeight: '500',
  },
  activeButton: {
    backgroundColor: '#e7f1ff',
    borderColor: '#4a90e2',
    color: '#1971c2',
  },
  zoomInfo: {
    marginLeft: 'auto',
    fontSize: '13px',
    color: '#6c757d',
    fontWeight: '500',
  },
  previewContainer: {
    flex: 1,
    overflow: 'auto',
    padding: '20px',
    display: 'grid',
    placeItems: 'safe center',
  },
  imageStack: {
    display: 'flex',
    flexDirection: 'column',
    width: 'min-content',
    margin: '0 auto',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#adb5bd',
  },
  emptyText: {
    marginTop: '16px',
    fontSize: '14px',
  },
}

export default Preview
