'use client'

import React, { useRef, useState } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'

interface MagneticCardProps {
  children: React.ReactNode
  className?: string
  tiltMax?: number
}

export default function MagneticCard({
  children,
  className = '',
  tiltMax = 15,
}: MagneticCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const glintRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)

  const { contextSafe } = useGSAP({ scope: cardRef })

  const onMouseMove = contextSafe((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !innerRef.current || !glintRef.current) return

    const { left, top, width, height } = cardRef.current.getBoundingClientRect()
    const x = e.clientX - left
    const y = e.clientY - top

    const xPercent = (x / width - 0.5) * 2 // -1 to 1
    const yPercent = (y / height - 0.5) * 2 // -1 to 1

    // 3D Tilt
    gsap.to(innerRef.current, {
      rotateY: xPercent * tiltMax,
      rotateX: -yPercent * tiltMax,
      duration: 0.4,
      ease: 'power2.out',
    })

    // Glint Effect
    gsap.to(glintRef.current, {
      x: xPercent * 50,
      y: yPercent * 50,
      opacity: 0.4,
      duration: 0.4,
      ease: 'power2.out',
    })
  })

  const onMouseLeave = contextSafe(() => {
    if (!innerRef.current || !glintRef.current) return

    gsap.to(innerRef.current, {
      rotateY: 0,
      rotateX: 0,
      duration: 0.6,
      ease: 'elastic.out(1, 0.5)',
    })

    gsap.to(glintRef.current, {
      opacity: 0,
      duration: 0.6,
    })
  })

  return (
    <div
      ref={cardRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={`relative perspective-1000 ${className}`}
      style={{ perspective: '1000px' }}
    >
      <div
        ref={innerRef}
        className="relative h-full w-full transition-transform duration-100 ease-out will-change-transform"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {children}
        
        {/* Reflection / Glint */}
        <div
          ref={glintRef}
          className="pointer-events-none absolute inset-0 opacity-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.3)_0%,transparent_70%)]"
          style={{ transform: 'translateZ(20px)' }}
        />
      </div>
    </div>
  )
}
