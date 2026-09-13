import React, { useEffect, useRef, useState } from 'react'
import { WorldEngine } from './WorldEngine.js'

function isWebGLAvailable() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    )
  } catch {
    return false
  }
}

export default function MedievalCanvas({ scrollProgress = 0, isAuthSuccess = false }) {
  const canvasRef = useRef(null)
  const engineRef = useRef(null)
  const [webGLSupported, setWebGLSupported] = useState(true)

  useEffect(() => {
    if (!isWebGLAvailable()) {
      setWebGLSupported(false)
      return
    }

    if (canvasRef.current && !engineRef.current) {
      engineRef.current = new WorldEngine(canvasRef.current)
    }

    return () => {
      if (engineRef.current) {
        engineRef.current.destroy()
        engineRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setScrollProgress(scrollProgress)
    }
  }, [scrollProgress])

  useEffect(() => {
    if (isAuthSuccess && engineRef.current) {
      engineRef.current.openCastleGates()
    }
  }, [isAuthSuccess])

  if (!webGLSupported) {
    return (
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-b from-[#06050b] via-[#0d0a14] to-[#1a1222] flex items-center justify-center">
        <div className="text-center p-6 text-amber-200/80 font-serif">
          <p className="text-sm tracking-widest uppercase">The Void</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ display: 'block' }}
      />
    </div>
  )
}
