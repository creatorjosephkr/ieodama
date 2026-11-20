import { useState, useCallback } from 'react'
import type { ImageItem } from '../types'
import { getFileName, toLocalResourceUrl } from '../utils/imageFiles'

export function useImageList() {
  const [images, setImages] = useState<ImageItem[]>([])

  const addImages = useCallback(async (filePaths: string[], atIndex?: number) => {
    const newImages: ImageItem[] = []
    const failedFiles: string[] = []

    for (const filePath of filePaths) {
      try {
        const thumbnail = toLocalResourceUrl(filePath)
        const dimensions = await getImageDimensions(thumbnail)

        newImages.push({
          id: crypto.randomUUID(),
          path: filePath,
          thumbnail,
          width: dimensions.width,
          height: dimensions.height,
        })
      } catch (err) {
        console.error(`이미지 로드 실패 (${filePath}):`, err)
        failedFiles.push(getFileName(filePath))
      }
    }

    if (newImages.length > 0) {
      setImages((prev) => {
        if (typeof atIndex === 'number') {
          const result = [...prev]
          result.splice(atIndex, 0, ...newImages)
          return result
        }
        return [...prev, ...newImages]
      })
    }

    if (failedFiles.length > 0) {
      alert(`다음 이미지를 불러오지 못했습니다:\n${failedFiles.join('\n')}`)
    }
  }, [])

  const removeImage = useCallback((id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id))
  }, [])

  const reorderImages = useCallback((sourceIndex: number, destIndex: number) => {
    setImages((prev) => {
      const result = [...prev]
      const [removed] = result.splice(sourceIndex, 1)
      result.splice(destIndex, 0, removed)
      return result
    })
  }, [])

  const replaceImage = useCallback(async (id: string, newPath: string) => {
    try {
      const thumbnail = toLocalResourceUrl(newPath)
      const dimensions = await getImageDimensions(thumbnail)

      setImages((prev) =>
        prev.map((img) =>
          img.id === id
            ? { ...img, path: newPath, thumbnail, width: dimensions.width, height: dimensions.height }
            : img
        )
      )
    } catch (err) {
      console.error(`이미지 교체 실패 (${newPath}):`, err)
      alert(`이미지를 불러오지 못했습니다: ${getFileName(newPath)}`)
    }
  }, [])

  const resetImages = useCallback(() => {
    setImages([])
  }, [])

  return {
    images,
    addImages,
    removeImage,
    reorderImages,
    replaceImage,
    resetImages,
  }
}

function getImageDimensions(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      if (img.naturalWidth <= 0 || img.naturalHeight <= 0) {
        reject(new Error('Invalid image dimensions'))
        return
      }
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
    }
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`))
    img.src = src
  })
}
