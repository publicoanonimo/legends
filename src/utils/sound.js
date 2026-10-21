// Web Audio API ambient & tactile sound engine (zero external dependencies)
let audioCtx = null

function getAudioContext() {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (AudioContext) {
      audioCtx = new AudioContext()
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

// Tactile button tap feedback (Emil Kowalski style snappy feedback)
export function playClickSound() {
  try {
    const ctx = getAudioContext()
    if (!ctx) return
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(320, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.04)

    gain.gain.setValueAtTime(0.08, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start()
    osc.stop(ctx.currentTime + 0.04)
  } catch (e) {
    // Ignore audio autoplay restrictions
  }
}

// Celebration / Booking success chime
export function playSuccessSound() {
  try {
    const ctx = getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime
    const notes = [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, now + idx * 0.06)

      gain.gain.setValueAtTime(0.09, now + idx * 0.06)
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.28)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now + idx * 0.06)
      osc.stop(now + idx * 0.06 + 0.29)
    })
  } catch (e) {
    // Ignore
  }
}

// Eerie Halloween chord for modal popup
export function playEerieSound() {
  try {
    const ctx = getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime
    const osc1 = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const gain = ctx.createGain()

    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(146.83, now) // D3
    osc1.frequency.exponentialRampToValueAtTime(138.59, now + 0.6) // C#3 (minor dissonance)

    osc2.type = 'sawtooth'
    osc2.frequency.setValueAtTime(220, now)
    osc2.frequency.exponentialRampToValueAtTime(207.65, now + 0.6)

    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(450, now)

    gain.gain.setValueAtTime(0.12, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7)

    osc1.connect(filter)
    osc2.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)

    osc1.start(now)
    osc2.start(now)
    osc1.stop(now + 0.75)
    osc2.stop(now + 0.75)
  } catch (e) {
    // Ignore
  }
}
