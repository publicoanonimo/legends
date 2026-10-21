import { useEffect, useState } from 'react'
import { X, ZoomIn, ZoomOut, Download, ExternalLink } from 'lucide-react'

export default function LightboxModal({ image, onClose }) {
  const [zoomed, setZoomed] = useState(false)

  useEffect(() => {
    if (!image) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [image, onClose])

  if (!image) return null

  return (
    <div
      className="lightbox-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={image.alt || 'Visualizador de afiche'}
      onClick={onClose}
    >
      <div className="lightbox-container" onClick={(e) => e.stopPropagation()}>
        <div className="lightbox-toolbar">
          <span className="lightbox-title">{image.title || 'Afiche Oficial'}</span>
          <div className="lightbox-actions">
            <button
              className="lightbox-btn"
              onClick={() => setZoomed(!zoomed)}
              title={zoomed ? 'Reducir' : 'Ampliar'}
              aria-label={zoomed ? 'Reducir zoom' : 'Ampliar zoom'}
            >
              {zoomed ? <ZoomOut size={18} /> : <ZoomIn size={18} />}
            </button>
            <a
              className="lightbox-btn"
              href={image.src}
              download
              title="Descargar afiche"
              aria-label="Descargar afiche"
            >
              <Download size={18} />
            </a>
            <a
              className="lightbox-btn"
              href={image.src}
              target="_blank"
              rel="noreferrer"
              title="Abrir en pestaña nueva"
              aria-label="Abrir imagen completa"
            >
              <ExternalLink size={18} />
            </a>
            <button
              className="lightbox-btn close-btn"
              onClick={onClose}
              title="Cerrar (Esc)"
              aria-label="Cerrar visor"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className={`lightbox-body ${zoomed ? 'is-zoomed' : ''}`}>
          <img
            src={image.src}
            alt={image.alt || 'Afiche Paranormal Fest'}
            className="lightbox-img"
            onClick={() => setZoomed(!zoomed)}
          />
        </div>

        {image.caption && <p className="lightbox-caption">{image.caption}</p>}
      </div>
    </div>
  )
}
