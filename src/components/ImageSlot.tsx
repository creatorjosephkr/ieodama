import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { ImageItem } from '../types'
import { extractDroppedImagePaths } from '../utils/imageFiles'
import arrowUpDown from '../assets/arrow-up-down.svg'

interface ImageSlotProps {
  slotId: string
  image: ImageItem | null
  onAdd: (paths?: string[], atIndex?: number) => void
  onRemove: () => void
  onReplace: (newPath?: string) => void
  isLast?: boolean
  isSelected?: boolean
  onSelect?: () => void
  onKeyDown?: (e: React.KeyboardEvent) => void
  index?: number
}

const ImageSlot: React.FC<ImageSlotProps> = ({
  slotId,
  image,
  onAdd,
  onRemove,
  onReplace,
  isLast = false,
  isSelected = false,
  onSelect,
  onKeyDown,
  index,
}) => {
  const [isDragOver, setIsDragOver] = React.useState(false)
  const [isShiftPressed, setIsShiftPressed] = React.useState(false)
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: image?.id || slotId,
    disabled: !image,
  })

  const sortableStyle = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (image) {
      if (onSelect) {
        onSelect()
      } else {
        onReplace()
      }
    } else {
      onAdd()
    }
  }

  const handleDoubleClick = () => {
    if (image) {
      onReplace()
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    setIsShiftPressed(false)

    const imagePaths = extractDroppedImagePaths(e.dataTransfer.files)
    if (imagePaths.length > 0) {
      if (image && e.shiftKey) {
        onReplace(imagePaths[0])
      } else if (typeof index === 'number') {
        onAdd(imagePaths, index)
      } else {
        onAdd(imagePaths)
      }
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
    setIsShiftPressed(e.shiftKey)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    if (e.currentTarget.contains(e.relatedTarget as Node | null)) return
    setIsDragOver(false)
    setIsShiftPressed(false)
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        ...styles.slot,
        aspectRatio: image ? `${image.width} / ${image.height}` : undefined,
        height: image ? 'auto' : '150px',
        border: isSelected
          ? '2px solid #007aff'
          : image
            ? isDragOver && isShiftPressed
              ? '2px solid #007aff'
              : '1px solid #dee2e6'
            : isDragOver
              ? '2px solid #007aff'
              : '2px dashed #dee2e6',
        backgroundColor:
          isDragOver && (isShiftPressed || !image)
            ? 'rgba(0, 122, 255, 0.05)'
            : image
              ? '#ffffff'
              : '#f8f9fa',
        boxShadow: isSelected ? '0 0 0 2px rgba(0, 122, 255, 0.3)' : 'none',
        outline: 'none',
        ...sortableStyle,
      }}
      {...attributes}
      tabIndex={image ? 0 : -1}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onKeyDown={onKeyDown}
    >
      {isDragOver && image && !isShiftPressed && (
        <div style={styles.dropInsertIndicator} />
      )}
      {image ? (
        <>
          <div {...listeners} style={styles.dragHandle} title="드래그하여 순서 변경">
            <img src={arrowUpDown} alt="순서 변경" style={{ width: '20px', height: '20px' }} />
          </div>
          <img src={image.thumbnail} alt="" style={{ ...styles.thumbnail, display: 'block' }} />
          <button
            type="button"
            style={styles.removeButton}
            title="삭제"
            aria-label="이미지 삭제"
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
          >
            <RemoveIcon />
          </button>
        </>
      ) : (
        <div style={styles.placeholder}>
          <PlusIcon />
          <span style={styles.placeholderText}>
            {isLast ? '이미지 추가' : '클릭 또는 드래그'}
          </span>
        </div>
      )}
    </div>
  )
}

const PlusIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#adb5bd">
    <line x1="12" y1="5" x2="12" y2="19" strokeWidth="2" strokeLinecap="round"/>
    <line x1="5" y1="12" x2="19" y2="12" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

const RemoveIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <circle cx="12" cy="12" r="10" strokeWidth="2"/>
    <line x1="15" y1="9" x2="9" y2="15" strokeWidth="2" strokeLinecap="round"/>
    <line x1="9" y1="9" x2="15" y2="15" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

const styles: { [key: string]: React.CSSProperties } = {
  slot: {
    width: '100%',
    backgroundColor: '#ffffff',
    border: '2px dashed #dee2e6',
    borderRadius: '8px',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'visible',
    transition: 'all 0.2s ease',
  },
  dropInsertIndicator: {
    position: 'absolute',
    top: -10,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#007aff',
    borderRadius: 2,
    zIndex: 100,
    boxShadow: '0 0 4px rgba(0,122,255,0.4)',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    borderRadius: '8px',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#adb5bd',
  },
  placeholderText: {
    marginTop: '8px',
    fontSize: '14px',
  },
  removeButton: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    width: '28px',
    height: '28px',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#dc3545',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  dragHandle: {
    position: 'absolute',
    top: '8px',
    left: '8px',
    width: '28px',
    height: '28px',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'grab',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
}

export default ImageSlot
