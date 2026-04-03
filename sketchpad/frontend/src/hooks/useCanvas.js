import { useRef, useState, useEffect, useCallback } from 'react'

/**
 * useCanvas — encapsulates all canvas drawing logic.
 * Returns refs and handlers to wire up to a <canvas> element.
 */
export function useCanvas({ brushSize, color, tool }) {
  const canvasRef = useRef(null)
  const isDrawing = useRef(false)
  const lastPos = useRef(null)
  const historyRef = useRef([])       // undo stack (ImageData snapshots)
  const redoStackRef = useRef([])     // redo stack

  // ─── Coordinate helpers ──────────────────────────────────────────────────
  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    if (e.touches) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      }
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  // ─── Save snapshot for undo ───────────────────────────────────────────────
  const saveSnapshot = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    historyRef.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height))
    // Cap history at 50 states to save memory
    if (historyRef.current.length > 50) historyRef.current.shift()
    redoStackRef.current = [] // clear redo on new action
  }, [])

  // ─── Start drawing ────────────────────────────────────────────────────────
  const startDrawing = useCallback((e) => {
    e.preventDefault()
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    saveSnapshot()
    isDrawing.current = true
    lastPos.current = getPos(e, canvas)

    // For fill tool: flood-fill on click
    if (tool === 'fill') {
      floodFill(ctx, canvas, lastPos.current, color)
      isDrawing.current = false
      return
    }

    // Draw a dot at the starting point
    ctx.beginPath()
    ctx.arc(lastPos.current.x, lastPos.current.y, brushSize / 2, 0, Math.PI * 2)
    ctx.fillStyle = tool === 'eraser' ? '#1a1a2e' : color
    ctx.fill()
  }, [tool, color, brushSize, saveSnapshot])

  // ─── Draw while moving ────────────────────────────────────────────────────
  const draw = useCallback((e) => {
    if (!isDrawing.current) return
    e.preventDefault()
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const pos = getPos(e, canvas)

    ctx.lineWidth = brushSize
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = tool === 'eraser' ? '#1a1a2e' : color

    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'source-over'
    } else {
      ctx.globalCompositeOperation = 'source-over'
    }

    ctx.beginPath()
    ctx.moveTo(lastPos.current.x, lastPos.current.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()

    lastPos.current = pos
  }, [brushSize, color, tool])

  // ─── Stop drawing ─────────────────────────────────────────────────────────
  const stopDrawing = useCallback(() => {
    isDrawing.current = false
    lastPos.current = null
  }, [])

  // ─── Undo ─────────────────────────────────────────────────────────────────
  const undo = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || historyRef.current.length === 0) return
    const ctx = canvas.getContext('2d')
    // Save current state to redo stack
    redoStackRef.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height))
    // Restore previous state
    const prev = historyRef.current.pop()
    ctx.putImageData(prev, 0, 0)
  }, [])

  // ─── Redo ─────────────────────────────────────────────────────────────────
  const redo = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || redoStackRef.current.length === 0) return
    const ctx = canvas.getContext('2d')
    historyRef.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height))
    const next = redoStackRef.current.pop()
    ctx.putImageData(next, 0, 0)
  }, [])

  // ─── Clear canvas ─────────────────────────────────────────────────────────
  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    saveSnapshot()
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }, [saveSnapshot])

  // ─── Export canvas as PNG base64 ──────────────────────────────────────────
  const exportImage = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return null
    return canvas.toDataURL('image/png')
  }, [])

  // ─── Keyboard shortcuts (Ctrl+Z / Ctrl+Y) ────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); undo() }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') { e.preventDefault(); redo() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [undo, redo])

  // ─── Initialize canvas with dark background ───────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }, [])

  return { canvasRef, startDrawing, draw, stopDrawing, clearCanvas, exportImage, undo, redo }
}

// ─── Flood Fill (paint bucket tool) ──────────────────────────────────────────
function floodFill(ctx, canvas, pos, fillColor) {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data
  const x = Math.floor(pos.x)
  const y = Math.floor(pos.y)
  const idx = (y * canvas.width + x) * 4
  const targetColor = [data[idx], data[idx + 1], data[idx + 2], data[idx + 3]]

  // Parse fill color hex → RGB
  const r = parseInt(fillColor.slice(1, 3), 16)
  const g = parseInt(fillColor.slice(3, 5), 16)
  const b = parseInt(fillColor.slice(5, 7), 16)

  if (targetColor[0] === r && targetColor[1] === g && targetColor[2] === b) return

  const stack = [[x, y]]
  const visited = new Set()

  while (stack.length) {
    const [cx, cy] = stack.pop()
    const key = `${cx},${cy}`
    if (visited.has(key)) continue
    if (cx < 0 || cy < 0 || cx >= canvas.width || cy >= canvas.height) continue

    const i = (cy * canvas.width + cx) * 4
    if (
      Math.abs(data[i] - targetColor[0]) > 30 ||
      Math.abs(data[i + 1] - targetColor[1]) > 30 ||
      Math.abs(data[i + 2] - targetColor[2]) > 30
    ) continue

    visited.add(key)
    data[i] = r; data[i + 1] = g; data[i + 2] = b; data[i + 3] = 255

    stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1])
  }

  ctx.putImageData(imageData, 0, 0)
}
