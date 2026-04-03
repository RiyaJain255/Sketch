import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Trash2, Download, PenLine, ArrowLeft } from 'lucide-react'
import '../styles/gallery.css'

const API = import.meta.env.VITE_API_URL || ''

export default function GalleryPage() {
  const [drawings, setDrawings] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null) // for lightbox
  const navigate = useNavigate()

  // Fetch all drawings for this user
  useEffect(() => {
    axios.get(`${API}/api/drawings`)
      .then(res => setDrawings(res.data.drawings))
      .catch(() => toast.error('Failed to load drawings'))
      .finally(() => setLoading(false))
  }, [])

  // Delete a drawing
  const handleDelete = async (id, e) => {
    e.stopPropagation()
    if (!confirm('Delete this drawing?')) return
    try {
      await axios.delete(`${API}/api/drawings/${id}`)
      setDrawings(prev => prev.filter(d => d._id !== id))
      if (selected?._id === id) setSelected(null)
      toast.success('Deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  // Download drawing as PNG
  const handleDownload = (drawing, e) => {
    e.stopPropagation()
    const link = document.createElement('a')
    link.href = drawing.imageData
    link.download = `${drawing.title || 'sketch'}.png`
    link.click()
  }

  return (
    <div className="gallery-page">
      <div className="gallery-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          <ArrowLeft size={16} /> Back to Canvas
        </button>
        <h1 className="gallery-title">Your Gallery</h1>
        <span className="gallery-count">{drawings.length} drawing{drawings.length !== 1 ? 's' : ''}</span>
      </div>

      {loading ? (
        <div className="gallery-loading">
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton-card" />)}
        </div>
      ) : drawings.length === 0 ? (
        <div className="gallery-empty">
          <PenLine size={48} strokeWidth={1} />
          <p>No drawings yet. Start creating!</p>
          <button className="btn-primary" onClick={() => navigate('/')}>Go Draw</button>
        </div>
      ) : (
        <div className="gallery-grid">
          {drawings.map(drawing => (
            <div
              key={drawing._id}
              className="gallery-card"
              onClick={() => setSelected(drawing)}
            >
              <div className="card-image-wrap">
                <img src={drawing.imageData} alt={drawing.title} loading="lazy" />
              </div>
              <div className="card-footer">
                <span className="card-title">{drawing.title || 'Untitled'}</span>
                <div className="card-actions">
                  <button onClick={(e) => handleDownload(drawing, e)} title="Download">
                    <Download size={14} />
                  </button>
                  <button onClick={(e) => handleDelete(drawing._id, e)} title="Delete" className="delete-btn">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox overlay */}
      {selected && (
        <div className="lightbox" onClick={() => setSelected(null)}>
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <img src={selected.imageData} alt={selected.title} />
            <div className="lightbox-bar">
              <span>{selected.title}</span>
              <div>
                <button onClick={(e) => handleDownload(selected, e)}><Download size={16} /> Download</button>
                <button className="delete-btn" onClick={(e) => handleDelete(selected._id, e)}><Trash2 size={16} /> Delete</button>
              </div>
            </div>
            <button className="lightbox-close" onClick={() => setSelected(null)}>✕</button>
          </div>
        </div>
      )}
    </div>
  )
}
