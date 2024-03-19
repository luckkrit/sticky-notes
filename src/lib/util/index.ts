import { clsx, type ClassValue } from "clsx"
import { debounce } from "lodash"
import { useEffect, useMemo, useRef } from "react"
import { PixelCrop } from "react-image-crop"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

const TO_RADIANS = Math.PI / 180

export async function canvasPreview(
    image: HTMLImageElement,
    canvas: HTMLCanvasElement,
    canvas2: HTMLCanvasElement,
    crop: { x: number, y: number, width: number, height: number },
    scale = 1,
    rotate = 0
) {
    const ctx = canvas.getContext('2d')

    if (!ctx) {
        throw new Error('No 2d context')
    }
    const bounds = canvas2.getBoundingClientRect()
    let width = 1
    let height = 1
    if (bounds !== undefined) {
        width = bounds.width
        height = bounds.height
    }
    // console.log(canvas2.getBoundingClientRect())
    // const scaleY = image.naturalHeight / image.height
    // const scaleX = image.naturalWidth / image.width
    // const scaleX = image.naturalWidth / 608
    // const scaleY = image.naturalHeight / 410.67
    const scaleX = image.naturalWidth / width
    const scaleY = image.naturalHeight / height

    // console.log(scaleX, scaleY)
    // devicePixelRatio slightly increases sharpness on retina devices
    // at the expense of slightly slower render times and needing to
    // size the image back down if you want to download/upload and be
    // true to the images natural size.
    const pixelRatio = window.devicePixelRatio
    // const pixelRatio = 1

    canvas.width = Math.floor(crop.width * scaleX * pixelRatio)
    canvas.height = Math.floor(crop.height * scaleY * pixelRatio)

    ctx.scale(pixelRatio, pixelRatio)
    ctx.imageSmoothingQuality = 'high'

    const cropX = crop.x * scaleX
    const cropY = crop.y * scaleY

    const rotateRads = rotate * TO_RADIANS
    const centerX = image.naturalWidth / 2
    const centerY = image.naturalHeight / 2

    ctx.save()

    // 5) Move the crop origin to the canvas origin (0,0)
    ctx.translate(-cropX, -cropY)
    // 4) Move the origin to the center of the original position
    ctx.translate(centerX, centerY)
    // 3) Rotate around the origin
    ctx.rotate(rotateRads)
    // 2) Scale the image
    ctx.scale(scale, scale)
    // 1) Move the center of the image to the origin (0,0)
    ctx.translate(-centerX, -centerY)
    ctx.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight, 0, 0, image.naturalWidth, image.naturalHeight)

    ctx.restore()
}
export async function dataUrlToFile(dataUrl: string, fileName: string): Promise<File> {
    const res: Response = await fetch(dataUrl); // grabbing the image data
    const blob: Blob = await res.blob();
    return new File([blob], fileName, { type: 'image/jpg' });
}
export const useDebounce = <T extends unknown[], S>(callback: (...args: T) => S, delay: number = 1000) => {
    const ref = useRef(callback)

    useEffect(() => {
        ref.current = callback
    }, [callback])

    const debouncedCallback = useMemo(() => {
        // pass arguments to callback function
        const func = (...arg: T) => {
            return ref.current(...arg)
        }

        return debounce(func, delay)
        // or just debounce(ref.current, delay)
    }, [delay])

    return debouncedCallback
}

