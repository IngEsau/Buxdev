"use client"

import Image from "next/image"
import dynamic from "next/dynamic"
import { useRef, useState } from "react"

import { useLanguage } from "@/hooks/use-language"

const ImageZoomDialog = dynamic(() => import("./image-zoom-dialog").then(module => module.ImageZoomDialog), { ssr: false })

type ImageZoomProps = {
  src: string
  alt: string
  width: number
  height: number
  sizes: string
  className?: string
  priority?: boolean
}

export function ImageZoom({ src, alt, width, height, sizes, className = "", priority = false }: ImageZoomProps) {
  const { t } = useLanguage()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [isOpen, setIsOpen] = useState(false)

  return <>
    <button ref={triggerRef} type="button" className={className} style={{ display: "block", minWidth: 0, padding: 0, cursor: "zoom-in" }}
      onClick={() => setIsOpen(true)} aria-label={`${t.portfolio.actions.viewImage}: ${alt}`}>
      <Image src={src} alt={alt} width={width} height={height} sizes={sizes} priority={priority} />
    </button>
    {isOpen ? <ImageZoomDialog src={src} alt={alt} width={width} height={height}
      labels={t.portfolio.actions} onDismiss={() => { setIsOpen(false); triggerRef.current?.focus() }} /> : null}
  </>
}
