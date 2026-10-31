import { Clock } from 'lucide-react'

export default function Countdown() {
  const units = [
    { label: 'DÍAS', value: 0, isHighlight: false },
    { label: 'HORAS', value: 0, isHighlight: false },
    { label: 'MIN', value: 0, isHighlight: false },
    { label: 'SEG', value: 0, isHighlight: true },
  ]

  return (
    <div className="countdown-widget-pro" aria-label="Cuenta regresiva para Paranormal Fest">
      <div className="countdown-top-bar">
        <div className="countdown-header-tag">
          <Clock size={15} className="text-crimson" />
          <span className="countdown-tag-text">CUENTA REGRESIVA</span>
        </div>
      </div>
      <div className="countdown-cards-row">
        {units.map((unit, index) => (
          <div key={unit.label} className="countdown-block-wrapper">
            <div className={`countdown-flip-card ${unit.isHighlight ? 'is-highlight' : ''}`}>
              <div className="card-split-divider" />
              <span className="flip-card-number">{String(unit.value).padStart(2, '0')}</span>
            </div>
            <span className="flip-card-label">{unit.label}</span>
            {index < units.length - 1 && <span className="flip-card-dots">:</span>}
          </div>
        ))}
      </div>
    </div>
  )
}
