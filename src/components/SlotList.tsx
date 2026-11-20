import React from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import type { ImageItem } from '../types'
import ImageSlot from './ImageSlot'

interface SlotListProps {
  images: ImageItem[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  onAddImages: (paths: string[], atIndex?: number) => void
  onRemoveImage: (id: string) => void
  onReorderImages: (sourceIndex: number, destIndex: number) => void
  onReplaceImage: (id: string, newPath: string) => void
}

const SlotList: React.FC<SlotListProps> = ({
  images,
  selectedId,
  onSelect,
  onAddImages,
  onRemoveImage,
  onReorderImages,
  onReplaceImage,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = images.findIndex((img) => img.id === active.id)
      const newIndex = images.findIndex((img) => img.id === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        onReorderImages(oldIndex, newIndex)
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    const index = images.findIndex((img) => img.id === id)
    if (index === -1) return

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (index > 0) {
        onReorderImages(index, index - 1)
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (index < images.length - 1) {
        onReorderImages(index, index + 1)
      }
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault()
      onRemoveImage(id)
      onSelect(null)
    }
  }

  const handleAddClick = async (paths?: string[], atIndex?: number) => {
    if (paths && paths.length > 0) {
      onAddImages(paths, atIndex)
      return
    }

    if (!window.electronAPI) {
      alert('Electron API가 로드되지 않았습니다.')
      return
    }

    try {
      const selectedPaths = await window.electronAPI.openFile()
      if (selectedPaths.length > 0) {
        onAddImages(selectedPaths, atIndex)
      }
    } catch (error) {
      console.error('파일 선택 오류:', error)
    }
  }

  const handleReplaceClick = async (id: string, newPath?: string) => {
    if (newPath) {
      onReplaceImage(id, newPath)
      return
    }

    if (!window.electronAPI) {
      alert('Electron API가 로드되지 않았습니다.')
      return
    }

    try {
      const selectedPaths = await window.electronAPI.openFile()
      if (selectedPaths.length > 0) {
        onReplaceImage(id, selectedPaths[0])
      }
    } catch (error) {
      console.error('파일 선택 오류:', error)
    }
  }

  // 최소 3개의 슬롯 + 마지막 추가 슬롯
  const minSlots = 3
  const emptySlots = Math.max(0, minSlots - images.length)
  const slots = [...images, ...Array(emptySlots).fill(null)]

  return (
    <div style={styles.container} onClick={(e) => e.target === e.currentTarget && onSelect(null)}>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={images.map((img) => img.id)} strategy={verticalListSortingStrategy}>
          <div style={styles.slotList} onClick={(e) => e.target === e.currentTarget && onSelect(null)}>
            {slots.map((image, index) => {
              const slotId = image?.id || `empty-${index}`
              return (
                <ImageSlot
                  key={slotId}
                  slotId={slotId}
                  image={image}
                  index={index}
                  isSelected={image?.id === selectedId}
                  onSelect={() => image && onSelect(image.id)}
                  onAdd={handleAddClick}
                  onRemove={() => image && onRemoveImage(image.id)}
                  onReplace={(newPath) => image && handleReplaceClick(image.id, newPath)}
                  onKeyDown={(e) => image && handleKeyDown(e, image.id)}
                />
              )
            })}
            {/* 항상 표시되는 마지막 추가 슬롯 */}
            <ImageSlot
              slotId="empty-last"
              image={null}
              onAdd={handleAddClick}
              onRemove={() => {}}
              onReplace={() => {}}
              isLast={true}
            />
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    width: '100%',
    height: '100%',
    overflowY: 'auto',
    overflowX: 'hidden',
    backgroundColor: '#f8f9fa',
    padding: '20px',
  },
  slotList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    width: '100%',
    maxWidth: '300px',
    margin: '0 auto',
  },
}

export default SlotList
