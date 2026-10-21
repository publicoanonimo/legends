import { useState, useEffect } from 'react'
import { X, MessageSquare, Phone } from 'lucide-react'
import confetti from 'canvas-confetti'
import { playSuccessSound } from '../utils/sound'

export const STAFF_MEMBERS = [
  { id: 'carlos', name: 'CARLOS', phone: '60109945' },
  { id: 'limber', name: 'LIMBER', phone: '78765205' },
  { id: 'mica', name: 'MICA', phone: '76584608' },
  { id: 'george', name: 'GEORGE', phone: '68176771' },
  { id: 'moira', name: 'MOIRA', phone: '75264279' },
  { id: 'lau', name: 'LAU', phone: '75889805' },
]

const ticketTypes = [
  { id: 'preventa', name: 'Entrada Preventa', price: 10, note: 'Incluye fiesta y Casa del Terror' },
  { id: 'pennywise', name: 'Mesa Pennywise', price: 250, note: 'La Casa Real + 10 manillas + Sprite + Jarra/hielo + 1 Free Pass' },
  { id: 'infierno', name: 'Mesa del Infierno', price: 260, note: 'Ron + 10 manillas + Sprite + Jarra/hielo + 1 Free Pass' },
  { id: 'fantasma', name: 'Mesa Fantasma', price: 300, note: 'Jägermeister + 2 Red Bull + 10 manillas + Hielo/jarra + 1 Free Pass' },
  { id: 'maldita', name: 'Mesa Maldita', price: 280, note: 'Rebel + Refresco + Jarra/hielo + 10 manillas + 1 Free Pass' },
  { id: 'conjuro', name: 'Mesa de Conjuro', price: 280, note: 'Ron + Refresco + Jarra/hielo + 10 manillas + 1 Free Pass' },
]

export default function BookingModal({ initialPackageId = 'preventa', onClose, onToast }) {
  const [selectedStaff, setSelectedStaff] = useState(STAFF_MEMBERS[0].id)
  const [quantity, setQuantity] = useState(1)
  const [name, setName] = useState('')

  const currentItem = ticketTypes.find((t) => t.id === initialPackageId) || ticketTypes[0]
  const activeStaff = STAFF_MEMBERS.find((s) => s.id === selectedStaff) || STAFF_MEMBERS[0]
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

  const generateWhatsappText = (staffName = activeStaff.name) => {
    const clientName = name.trim() || 'Amigo de The Legends'
    return encodeURIComponent(
      `¡Hola ${staffName}! 🎃👻\n` +
      `Quiero reservar para el PARANORMAL FEST (viernes 30 de octubre desde las 17:00):\n\n` +
      `👤 Nombre: ${clientName}\n` +
      `🎟️ Cantidad: ${quantity}\n` +
      `💰 Total: ${totalPrice} Bs\n` +
      `¿Me envías la información y QR para confirmar mi reserva? ¡Muchas gracias!`
    )
  }

  const handleDirectChat = (staff) => {
    playSuccessSound()
    try {
      confetti({
        particleCount: 55,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#ff1744', '#8b2bff', '#00d9ff', '#ffd700'],
      })
    } catch (e) {
      // ignore
    }

    const text = generateWhatsappText(staff.name)
    const whatsappUrl = `https://wa.me/591${staff.phone}?text=${text}`
    window.open(whatsappUrl, '_blank')

    if (onToast) {
      onToast({
        type: 'success',
        title: `¡Chat con ${staff.name}!`,
        message: `Abriendo WhatsApp con ${staff.name} (${staff.phone}) para coordinar tu preventa.`,
      })
    }
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="booking-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="modal-kicker">✦ THE LEGENDS · PREVENTA DIRECTA</span>
            <h3 className="modal-title">Asegura tu entrada con nuestro Staff</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Cerrar modal">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Staff Direct Selector */}
          <div className="field-group">
            <div className="field-label-row">
              <label className="field-label">Elige a tu Staff de confianza</label>
              <span className="field-sub-badge">WhatsApp Directo</span>
            </div>
            <div className="staff-grid">
              {STAFF_MEMBERS.map((staff) => {
                const isSelected = selectedStaff === staff.id
                return (
                  <div
                    key={staff.id}
                    className={`staff-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedStaff(staff.id)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Seleccionar a ${staff.name}, ${staff.phone}`}
                  >
                    <div className="staff-card-top">
                      <div className="staff-radio">
                        {isSelected && <span className="staff-radio-dot" />}
                      </div>
                      <div className="staff-meta">
                        <strong className="staff-name">{staff.name}</strong>
                        <span className="staff-number">{staff.phone}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="modal-row">
            <div className="field-group flex-1">
              <label className="field-label" htmlFor="client-name">Tu Nombre (opcional)</label>
              <input
                id="client-name"
                type="text"
                className="modal-input"
                placeholder="Ej. Juan Pérez / Amigos"
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
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="submit-booking-btn"
            onClick={() => handleDirectChat(activeStaff)}
          >
            <MessageSquare size={18} />
            <span>Chatear por WhatsApp ({activeStaff.phone}) · {totalPrice} Bs</span>
          </button>
        </div>
      </div>
    </div>
  )
}
