import { STAFF_MEMBERS } from './BookingModal'
import { playClickSound } from '../utils/sound'

export default function StaffSection() {
  return (
    <section className="presale-staff-strip" aria-label="Contacto directo con el staff">
      <span className="staff-strip-label">✦ CHATEA DIRECTO CON NUESTRO STAFF (WHATSAPP):</span>
      <div className="staff-strip-grid">
        {STAFF_MEMBERS.map((staff) => (
          <a
            key={staff.id}
            href={`https://wa.me/591${staff.phone}?text=${encodeURIComponent(`¡Hola ${staff.name}! 🎃👻 Quiero comprar mi preventa de 10 Bs para Paranormal Fest.`)}`}
            target="_blank"
            rel="noreferrer"
            className="staff-strip-chip"
            onClick={playClickSound}
            title={`Chatear con ${staff.name} (${staff.phone})`}
          >
            <span className="staff-chip-dot" />
            <strong>{staff.name}</strong>
            <span className="staff-chip-phone">{staff.phone}</span>
          </a>
        ))}
      </div>
    </section>
  )
}
