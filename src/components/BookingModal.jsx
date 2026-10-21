import { useState, useEffect } from 'react'
import { X, MessageSquare, Check, Sparkles, Copy, QrCode } from 'lucide-react'
import confetti from 'canvas-confetti'
import { playSuccessSound } from '../utils/sound'

const ticketTypes = [
  { id: 'preventa', name: 'Entrada Preventa', price: 10, note: 'Incluye fiesta y Casa del Terror' },
  { id: 'pennywise', name: 'Mesa Pennywise', price: 250, note: 'La Casa Real + 10 manillas + Sprite + Jarra/hielo + 1 Free Pass' },
  { id: 'infierno', name: 'Mesa del Infierno', price: 260, note: 'Ron + 10 manillas + Sprite + Jarra/hielo + 1 Free Pass' },
  { id: 'fantasma', name: 'Mesa Fantasma', price: 300, note: 'Jägermeister + 2 Red Bull + 10 manillas + Hielo/jarra + 1 Free Pass' },
  { id: 'maldita', name: 'Mesa Maldita', price: 280, note: 'Rebel + Refresco + Jarra/hielo + 10 manillas + 1 Free Pass' },
  { id: 'conjuro', name: 'Mesa de Conjuro', price: 280, note: 'Ron + Refresco + Jarra/hielo + 10 manillas + 1 Free Pass' },
]

export default function BookingModal({ initialPackageId = 'preventa', onClose, onToast }) {
  const [selectedType, setSelectedType] = useState(initialPackageId)
  const [quantity, setQuantity] = useState(1)
  const [name, setName] = useState('')
  const [showQr, setShowQr] = useState(false)
  const [copied, setCopied] = useState(false)

  const currentItem = ticketTypes.find((t) => t.id === selectedType) || ticketTypes[0]
  const totalPrice = currentItem.price * quantity

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  const generateWhatsappText = () => {
    const clientName = name.trim() || 'Amigo de The Legends'
    return encodeURIComponent(
      `¡Hola THE LEGENDS! 🎃👻\n` +
      `Quiero reservar para el PARANORMAL FEST (30 de Octubre en San Pedro):\n\n` +
      `👤 Nombre: ${clientName}\n` +
      `🎟️ Reserva: ${quantity}x ${currentItem.name}\n` +
      `💰 Total: ${totalPrice} Bs\n` +
      `✨ Incluye: ${currentItem.note}\n\n` +
      `¿Me envían el QR para confirmar mi reserva? ¡Gracias!`
    )
  }

  const handleBooking = () => {
    playSuccessSound()
    try {
      confetti({
        particleCount: 65,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#ff1744', '#8b2bff', '#00d9ff', '#ffd700'],
      })
    } catch (e) {
      // ignore
    }

    const whatsappUrl = `https://wa.me/?text=${generateWhatsappText()}`
    window.open(whatsappUrl, '_blank')

    if (onToast) {
      onToast({
        type: 'success',
        title: '¡Reserva iniciada!',
        message: 'Se abrió WhatsApp para confirmar con los organizadores.',
      })
    }
  }

  const handleCopy = () => {
    const text = decodeURIComponent(generateWhatsappText())
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    if (onToast) {
      onToast({
        type: 'info',
        title: 'Copiado al portapapeles',
        message: 'Texto de reserva listo para enviar por WhatsApp.',
      })
    }
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="booking-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="modal-kicker">✦ THE LEGENDS · RESERVAS</span>
            <h3 className="modal-title">Asegura tu lugar</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Cerrar modal">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="field-group">
            <label className="field-label">Tipo de Reserva / Mesa</label>
            <div className="package-selector">
              {ticketTypes.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`package-pill ${selectedType === item.id ? 'active' : ''}`}
                  onClick={() => setSelectedType(item.id)}
                >
                  <span className="pill-name">{item.name}</span>
                  <span className="pill-price">{item.price} Bs</span>
                </button>
              ))}
            </div>
            <div className="selected-item-note">
              <Sparkles size={14} className="note-icon" />
              <span>{currentItem.note}</span>
            </div>
          </div>

          <div className="modal-row">
            <div className="field-group flex-1">
              <label className="field-label" htmlFor="client-name">Tu Nombre o de tu Grupo</label>
              <input
                id="client-name"
                type="text"
                className="modal-input"
                placeholder="Ej. Juan Pérez / Grupo Terror"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="field-group width-auto">
              <label className="field-label">Cantidad</label>
              <div className="stepper">
                <button
                  type="button"
                  className="step-btn"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="step-count">{quantity}</span>
                <button
                  type="button"
                  className="step-btn"
                  onClick={() => setQuantity(Math.min(10, quantity + 1))}
                  disabled={quantity >= 10}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-left">
              <span className="summary-label">TOTAL A PAGAR</span>
              <strong className="summary-total">{totalPrice} <small>Bs</small></strong>
            </div>
            <div className="summary-right">
              <button
                type="button"
                className="qr-toggle-btn"
                onClick={() => setShowQr(!showQr)}
              >
                <QrCode size={16} />
                <span>{showQr ? 'Ocultar QR' : 'Ver QR Preventa'}</span>
              </button>
            </div>
          </div>

          {showQr && (
            <div className="qr-preview-box">
              <img
                src="/paranormal-preventa.jpeg"
                alt="Afiche oficial con código QR de WhatsApp"
                className="qr-preview-img"
              />
              <p>Escanea el código QR que viene en el afiche o presiona Reservar por WhatsApp.</p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="copy-btn"
            onClick={handleCopy}
            title="Copiar mensaje"
          >
            {copied ? <Check size={16} className="text-emerald" /> : <Copy size={16} />}
            <span>{copied ? 'Copiado' : 'Copiar'}</span>
          </button>

          <button
            type="button"
            className="submit-booking-btn"
            onClick={handleBooking}
          >
            <MessageSquare size={18} />
            <span>Reservar por WhatsApp ({totalPrice} Bs)</span>
          </button>
        </div>
      </div>
    </div>
  )
}
