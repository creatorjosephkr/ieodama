import sharp, { type Metadata, type OverlayOptions } from 'sharp'
import fs from 'fs/promises'
import heicConvert from 'heic-convert'

export interface CombineOptions {
  quality?: number
  format?: 'jpg' | 'jpeg' | 'png'
  targetWidth?: number
}

interface LoadedImage {
  buffer: Buffer
  width: number
  height: number
  path: string
}

const JPEG_MAX_DIMENSION = 65500

function getOrientedDimensions(metadata: Metadata): { width: number; height: number } {
  const rawWidth = metadata.width || 0
  const rawHeight = metadata.height || 0
  // EXIF Orientation 5~8은 90°/270° 회전을 포함하므로 가로/세로 크기를 맞바꿈
  const isSwapped = metadata.orientation !== undefined && metadata.orientation >= 5 && metadata.orientation <= 8
  return isSwapped ? { width: rawHeight, height: rawWidth } : { width: rawWidth, height: rawHeight }
}

export async function combineImages(
  imagePaths: string[],
  options: CombineOptions = {}
): Promise<Buffer> {
  if (!Array.isArray(imagePaths) || imagePaths.length === 0) {
    throw new Error('결합할 이미지가 없습니다.')
  }

  const { quality = 90, format = 'jpg', targetWidth } = options

  // 각 이미지 로드 및 EXIF 방향을 반영한 메타데이터 추출
  const images: LoadedImage[] = await Promise.all(
    imagePaths.map(async (filePath) => {
      let buffer = await fs.readFile(filePath)

      if (/\.(heic|heif)$/i.test(filePath)) {
        try {
          const convertedBuffer = await heicConvert({
            buffer,
            format: 'JPEG',
            quality: 1,
          })
          buffer = Buffer.from(convertedBuffer)
        } catch (err) {
          const detail = err instanceof Error ? err.message : String(err)
          throw new Error(`HEIC/HEIF 이미지 변환에 실패했습니다 (${filePath}): ${detail}`)
        }
      }

      const metadata = await sharp(buffer, { limitInputPixels: false }).metadata()
      const { width, height } = getOrientedDimensions(metadata)

      if (width <= 0 || height <= 0) {
        throw new Error(`이미지 크기를 읽을 수 없습니다 (${filePath}).`)
      }

      return { buffer, width, height, path: filePath }
    })
  )

  const originalMaxWidth = Math.max(...images.map((img) => img.width))
  const finalWidth =
    targetWidth && Number.isFinite(targetWidth) && targetWidth > 0
      ? Math.max(1, Math.round(targetWidth))
      : originalMaxWidth

  if (finalWidth <= 0) {
    throw new Error('유효한 출력 가로 너비를 계산할 수 없습니다.')
  }

  // 리사이징 전 각 이미지 높이와 전체 캔버스 높이 선계산
  const plannedItems = images.map((img) => {
    const scale = finalWidth / img.width
    const newHeight = Math.max(1, Math.round(img.height * scale))
    return { img, newHeight }
  })

  const totalHeight = plannedItems.reduce((sum, item) => sum + item.newHeight, 0)
  const isJpeg = format === 'jpg' || format === 'jpeg'

  if (isJpeg && (finalWidth > JPEG_MAX_DIMENSION || totalHeight > JPEG_MAX_DIMENSION)) {
    throw new Error(
      `JPEG 형식은 최대 65,500px까지 지원합니다 (현재 결과 크기: ${finalWidth}×${totalHeight}px). 가로 너비를 줄이거나 PNG 형식으로 저장해 주세요.`
    )
  }

  // 순차 리사이징 및 합성 입력 구성
  let currentTop = 0
  const compositeInputs: OverlayOptions[] = []

  for (const item of plannedItems) {
    // .rotate()로 EXIF 방향을 실제 픽셀에 반영한 뒤 정확한 비율 치수로 리사이징
    const resizedBuffer = await sharp(item.img.buffer, { limitInputPixels: false })
      .rotate()
      .resize(finalWidth, item.newHeight, {
        fit: 'fill',
        kernel: sharp.kernel.lanczos3,
        withoutEnlargement: false,
      })
      .toBuffer()

    compositeInputs.push({
      input: resizedBuffer,
      top: currentTop,
      left: 0,
    })

    currentTop += item.newHeight
  }

  // 빈 캔버스 생성 (PNG는 투명 배경, JPEG는 흰색 배경)
  const canvas = sharp({
    create: {
      width: finalWidth,
      height: totalHeight,
      channels: 4,
      background: isJpeg
        ? { r: 255, g: 255, b: 255, alpha: 1 }
        : { r: 255, g: 255, b: 255, alpha: 0 },
    },
    limitInputPixels: false,
  })

  let result = canvas.composite(compositeInputs)

  if (isJpeg) {
    const clampedQuality = Math.min(100, Math.max(1, Math.round(quality)))
    result = result.jpeg({ quality: clampedQuality, mozjpeg: true })
  } else {
    result = result.png({ compressionLevel: 9 })
  }

  return result.toBuffer()
}
