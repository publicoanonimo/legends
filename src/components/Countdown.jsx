import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  })

  useEffect(() => {
    // Target: October 30 at 21:00:00 local time
    const now = new Date()
    let currentYear = now.getFullYear()
    let target = new Date(currentYear, 9, 30, 21, 0, 0) // Month index 9 = October

    // If past, target next year
    if (now.getTime() > target.getTime()) {
      target = new Date(currentYear + 1, 9, 30, 21, 0, 0)
    }

    const updateCountdown = () => {
      const difference = target.getTime() - new Date().getTime()

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true })
        return
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24)
      const minutes = Math.floor((difference / 1000 / 60) % 60)
      const seconds = Math.floor((difference / 1000) % 60)

      setTimeLeft({ days, hours, minutes, seconds, isExpired: false })
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [])

  if (timeLeft.isExpired) {
    return (
      <div className="countdown-widget countdown-live-active">
        <span className="live-pulsing-badge" />
        <div className="live-copy">
          <strong>¡EL PARANORMAL FEST ESTÁ EN VIVO!</strong>
          <small>San Pedro, Bolivia · Puertas abiertas</small>
        </div>
      </div>
    )
  }

  const units = [
    { label: 'DÍAS', value: timeLeft.days, isHighlight: false },
    { label: 'HORAS', value: timeLeft.hours, isHighlight: false },
    { label: 'MIN', value: timeLeft.minutes, isHighlight: false },
    { label: 'SEG', value: timeLeft.seconds, isHighlight: true },
  ]

  return (
    <div
      className="countdown-widget-pro"
      aria-label="Cuenta regresiva para Paranormal Fest"
      onClick={onOpenDateModal}
      role={onOpenDateModal ? 'button' : undefined}
      tabIndex={onOpenDateModal ? 0 : undefined}
    >
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
              <span className="flip-card-number">
                {String(unit.value).padStart(2, '0')}
              </span>
            </div>
            <span className="flip-card-label">{unit.label}</span>
            {index < units.length - 1 && <span className="flip-card-dots">:</span>}
          </div>
        ))}
      </div>

    </div>
  )
}
