import { Brush, Eraser, PaintBucket, Trash2, Undo2, Redo2, Save, Images, Download } from 'lucide-react'
import '../styles/toolbar.css'

// ─── Preset color palette ─────────────────────────────────────────────────────
const PALETTE = [
  '#c9a96e', '#e8e0d5', '#ffffff',
  '#ff6b6b', '#ffa94d', '#ffd43b',
  '#69db7c', '#4dabf7', '#cc5de8',
  '#f06595', '#a9e34b', '#38d9a9',
  '#1a1a2e', '#16213e', '#0f3460',
]

export default function Toolbar({
  brushSize, setBrushSize,
  color, setColor,
  tool, setTool,
  onClear, onUndo, onRedo, onSave, onGallery
}) {

  // Download canvas as PNG without saving to server
  const handleLocalDownload = () => {
    const canvas = document.querySelector('.drawing-canvas')
    if (!canvas) return
    const link = document.createElement('a')
    link.href = canvas.toDataURL('image/png')
    link.download = 'sketch.png'
    link.click()
  }

  return (
    <aside className="toolbar">
      {/* Brand mark */}
      <div className="toolbar-brand">
        <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
          <path d="M8 32 Q14 8 20 20 Q26 32 32 8" stroke="#c9a96e" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        </svg>
      </div>

      <div className="toolbar-divider" />

      {/* Tool selection */}
      <div className="tool-group">
        <button
          className={`tool-btn ${tool === 'brush' ? 'active' : ''}`}
          onClick={() => setTool('brush')}
          title="Brush (B)"
        >
          <Brush size={18} />
        </button>
        <button
          className={`tool-btn ${tool === 'eraser' ? 'active' : ''}`}
          onClick={() => setTool('eraser')}
          title="Eraser (E)"
        >
          <Eraser size={18} />
        </button>
        <button
          className={`tool-btn ${tool === 'fill' ? 'active' : ''}`}
          onClick={() => setTool('fill')}
          title="Fill (F)"
        >
          <PaintBucket size={18} />
        </button>
      </div>

      <div className="toolbar-divider" />

      {/* Brush size slider */}
      <div className="size-group">
        <span className="size-label">size</span>
        <input
          type="range"
          min="1"
          max="60"
          value={brushSize}
          onChange={e => setBrushSize(Number(e.target.value))}
          className="size-slider"
        />
        {/* Visual preview dot */}
        <div
          className="size-preview"
          style={{
            width: Math.max(4, Math.min(brushSize, 32)),
            height: Math.max(4, Math.min(brushSize, 32)),
            background: color,
          }}
        />
      </div>

      <div className="toolbar-divider" />

      {/* Color picker (native) + swatches */}
      <div className="color-group">
        <label className="color-picker-wrap" title="Custom color">
          <input
            type="color"
            value={color}
            onChange={e => setColor(e.target.value)}
            className="color-input"
          />
          <div className="color-preview" style={{ background: color }} />
        </label>
        <div className="palette">
          {PALETTE.map(c => (
            <button
              key={c}
              className={`swatch ${color === c ? 'active' : ''}`}
              style={{ background: c }}
              onClick={() => setColor(c)}
              title={c}
            />
          ))}
        </div>
      </div>

      <div className="toolbar-divider" />

      {/* Actions */}
      <div className="action-group">
        <button className="action-btn" onClick={onUndo} title="Undo (Ctrl+Z)"><Undo2 size={16} /></button>
        <button className="action-btn" onClick={onRedo} title="Redo (Ctrl+Y)"><Redo2 size={16} /></button>
        <button className="action-btn danger" onClick={onClear} title="Clear canvas"><Trash2 size={16} /></button>
        <button className="action-btn" onClick={handleLocalDownload} title="Download PNG"><Download size={16} /></button>
        <button className="action-btn accent" onClick={onSave} title="Save to gallery"><Save size={16} /></button>
        <button className="action-btn" onClick={onGallery} title="My gallery"><Images size={16} /></button>
      </div>
    </aside>
  )
}
