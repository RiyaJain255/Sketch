import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useCanvas } from '../hooks/useCanvas.js'
import Toolbar from '../components/Toolbar.jsx'
import SaveModal from '../components/SaveModal.jsx'
import '../styles/drawing.css'

const API = import.meta.env.VITE_API_URL || ''

export default function DrawingPage() {
  // ─── Tool state ────────────────────────────────────────────────────────────
  const [brushSize, setBrushSize] = useState(6)
  const [color, setColor] = useState('#c9a96e')
  const [tool, setTool] = useState('brush') // 'brush' | 'eraser' | 'fill'
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const containerRef = useRef(null)
  const navigate = useNavigate()

  // Hook containing all canvas drawing logic
  const { canvasRef, startDrawing, draw, stopDrawing, clearCanvas, exportImage, undo, redo } =
    useCanvas({ brushSize, color, tool })

  // ─── Resize canvas to fill container ──────────────────────────────────────
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current
      const container = containerRef.current
      if (!canvas || !container) return
      // Save current drawing before resizing
      const ctx = canvas.getContext('2d')
      const snapshot = canvas.toDataURL()
      canvas.width = container.clientWidth
      canvas.height = container.clientHeight
      // Restore background + drawing
      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      const img = new Image()
      img.onload = () => ctx.drawImage(img, 0, 0)
      img.src = snapshot
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  // ─── Save drawing to backend ───────────────────────────────────────────────
  const handleSave = async (title) => {
    setSaving(true)
    try {
      const imageData = exportImage()
      if (!imageData) throw new Error('Canvas is empty')
      await axios.post(`${API}/api/drawings`, { title, imageData })
      toast.success('Drawing saved!')
      setShowSaveModal(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save drawing')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="drawing-page">
      {/* Left toolbar with tools */}
      <Toolbar
        brushSize={brushSize}
        setBrushSize={setBrushSize}
        color={color}
        setColor={setColor}
        tool={tool}
        setTool={setTool}
        onClear={clearCanvas}
        onUndo={undo}
        onRedo={redo}
        onSave={() => setShowSaveModal(true)}
        onGallery={() => navigate('/gallery')}
      />

      {/* Canvas container */}
      <div className="canvas-container" ref={containerRef}>
        <canvas
          ref={canvasRef}
          className={`drawing-canvas tool-${tool}`}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        <div className="canvas-hint">Start drawing…</div>
      </div>

      {/* Save modal */}
      {showSaveModal && (
        <SaveModal
          onSave={handleSave}
          onClose={() => setShowSaveModal(false)}
          saving={saving}
        />
      )}
    </div>
  )
}
