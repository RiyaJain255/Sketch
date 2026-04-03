import { useState } from 'react'
import { X } from 'lucide-react'
import '../styles/modal.css'

export default function SaveModal({ onSave, onClose, saving }) {
  const [title, setTitle] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(title.trim() || 'Untitled')
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><X size={16} /></button>
        <h2>Save Drawing</h2>
        <p>Give your masterpiece a name</p>
        <form onSubmit={handleSubmit}>
          <input
            autoFocus
            type="text"
            placeholder="e.g. Midnight Doodle"
            value={title}
            onChange={e => setTitle(e.target.value)}
            maxLength={60}
          />
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
