"use client"

import Image from "next/image"
import { ZoomIn, ZoomOut, Xmark } from "iconoir-react"
import { useEffect, useRef, useState, type PointerEvent } from "react"
import { createPortal } from "react-dom"

import styles from "./image-zoom.module.css"

type Labels = { zoomIn: string; zoomOut: string; closeImage: string }

export function ImageZoomDialog({ src, alt, width, height, labels, onDismiss }: {
  src: string
  alt: string
  width: number
  height: number
  labels: Labels
  onDismiss: () => void
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ x: number; y: number; left: number; top: number } | null>(null)
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 })
  const [dragging, setDragging] = useState(false)
  const [zoom, setZoom] = useState(1)

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) dialog.showModal()
  }, [])

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    const resize = new ResizeObserver(([entry]) => {
      setViewportSize({ width: entry.contentRect.width, height: entry.contentRect.height })
    })
    resize.observe(viewport)
    return () => resize.disconnect()
  }, [])

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport || !viewportSize.width) return
    const frame = requestAnimationFrame(() => {
      viewport.scrollLeft = (viewport.scrollWidth - viewport.clientWidth) / 2
      viewport.scrollTop = (viewport.scrollHeight - viewport.clientHeight) / 2
    })
    return () => cancelAnimationFrame(frame)
  }, [zoom, viewportSize])

  const fit = viewportSize.width && viewportSize.height
    ? Math.min(viewportSize.width / width, viewportSize.height / height, 1) : 1
  const imageWidth = Math.round(width * fit * zoom)
  const imageHeight = Math.round(height * fit * zoom)

  const startDrag = (event: PointerEvent<HTMLDivElement>) => {
    const viewport = viewportRef.current
    if (!viewport || zoom <= 1 || event.pointerType !== "mouse" || event.button !== 0) return
    dragRef.current = { x: event.clientX, y: event.clientY, left: viewport.scrollLeft, top: viewport.scrollTop }
    viewport.setPointerCapture(event.pointerId)
    setDragging(true)
  }

  const moveDrag = (event: PointerEvent<HTMLDivElement>) => {
    const viewport = viewportRef.current
    const drag = dragRef.current
    if (!viewport || !drag) return
    viewport.scrollLeft = drag.left - (event.clientX - drag.x)
    viewport.scrollTop = drag.top - (event.clientY - drag.y)
  }

  const stopDrag = () => {
    dragRef.current = null
    setDragging(false)
  }

  return createPortal(<dialog ref={dialogRef} className={styles.dialog} aria-label={alt} onClose={onDismiss}
    onClick={event => { if (event.target === dialogRef.current) dialogRef.current.close() }}>
    <div className={styles.dialogContent}>
      <div className={styles.toolbar}>
        <p>{alt}</p>
        <div className={styles.controls}>
          <button type="button" aria-label={labels.zoomOut} disabled={zoom <= 1}
            onClick={() => setZoom(value => Math.max(1, Math.round((value - 0.5) * 10) / 10))}><ZoomOut aria-hidden="true" /></button>
          <span aria-live="polite">{Math.round(zoom * 100)}%</span>
          <button type="button" aria-label={labels.zoomIn} disabled={zoom >= 4}
            onClick={() => setZoom(value => Math.min(4, Math.round((value + 0.5) * 10) / 10))}><ZoomIn aria-hidden="true" /></button>
          <button type="button" aria-label={labels.closeImage} onClick={() => dialogRef.current?.close()}><Xmark aria-hidden="true" /></button>
        </div>
      </div>
      <div ref={viewportRef} className={styles.viewport} data-zoomed={zoom > 1} data-dragging={dragging}
        onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={stopDrag} onPointerCancel={stopDrag}>
        <div className={styles.imageStage} style={{
          width: Math.max(viewportSize.width, imageWidth),
          height: Math.max(viewportSize.height, imageHeight),
        }}>
          <Image src={src} alt={alt} width={width} height={height} sizes="100vw"
            className={styles.fullImage} style={{ width: imageWidth, height: imageHeight, visibility: viewportSize.width ? "visible" : "hidden" }} />
        </div>
      </div>
    </div>
  </dialog>, document.body)
}
