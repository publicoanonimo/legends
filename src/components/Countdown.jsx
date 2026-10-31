import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'

function getCountdown() {
  const now = new Date()
  const getEventDate = (year) => {
    // El evento es el último viernes de octubre a las 17:00, hora local.
    const lastDay = new Date(year, 10, 0)
    const daysAfterFriday = (lastDay.getDay() - 5 + 7) % 7
    return new Date(year, 9, lastDay.getDate() - daysAfterFriday, 17, 0, 0)
  }

  let target = getEventDate(now.getFullYear())
  if (now.getTime() >= target.getTime()) target = getEventDate(now.getFullYear() + 1)

  const difference = target.getTime() - now.getTime()
  if (difference <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    isExpired: false,
  }
}

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState(getCountdown)

  useEffect(() => {
    const interval = setInterval(() => setTimeLeft(getCountdown()), 1000)
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
