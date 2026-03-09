import type { Phase } from '../types/timer'

let ctx: AudioContext | null = null
let _soundEnabled = true
let _lastPlayTime = 0
const DEBOUNCE_MS = 600

function getCtx(): AudioContext | null {
  if (
    typeof AudioContext === 'undefined' &&
    typeof (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext === 'undefined'
  ) {
    return null
  }
  if (!ctx) {
    const WinCtx = (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    ctx = new (AudioContext ?? WinCtx!)()
  }
  return ctx
}

/** Call inside a user-gesture handler to satisfy browser autoplay policy */
export function resumeAudioContext(): void {
  const audioCtx = getCtx()
  if (audioCtx && audioCtx.state === 'suspended') {
    void audioCtx.resume()
  }
}

/** Toggle sound on/off globally — persisted by the caller */
export function setSoundEnabled(enabled: boolean): void {
  _soundEnabled = enabled
}

function canPlay(): boolean {
  if (!_soundEnabled) return false
  const now = Date.now()
  if (now - _lastPlayTime < DEBOUNCE_MS) return false
  _lastPlayTime = now
  return true
}

function scheduleTone(
  audioCtx: AudioContext,
  frequency: number,
  startOffset: number,
  duration: number,
  volume: number,
): void {
  const osc = audioCtx.createOscillator()
  const gain = audioCtx.createGain()
  osc.connect(gain)
  gain.connect(audioCtx.destination)

  osc.type = 'sine'
  osc.frequency.value = frequency

  const t = audioCtx.currentTime + startOffset
  gain.gain.setValueAtTime(0, t)
  gain.gain.linearRampToValueAtTime(volume, t + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration)

  osc.start(t)
  osc.stop(t + duration + 0.01)
}

/**
 * study → break: two gentle descending tones (relax)
 * break → study: two ascending tones (alert)
 */
export function playTransitionSound(phase: Phase): void {
  if (!canPlay()) return
  const audioCtx = getCtx()
  if (!audioCtx) return

  try {
    if (phase === 'break') {
      scheduleTone(audioCtx, 784, 0, 0.3, 0.25)
      scheduleTone(audioCtx, 659, 0.2, 0.4, 0.2)
    } else {
      scheduleTone(audioCtx, 659, 0, 0.3, 0.2)
      scheduleTone(audioCtx, 784, 0.2, 0.4, 0.25)
    }
  } catch {
    // ignore
  }
}

/** Three-tone completion chime for single-mode finish */
export function playCompletionSound(): void {
  if (!canPlay()) return
  const audioCtx = getCtx()
  if (!audioCtx) return

  try {
    scheduleTone(audioCtx, 523, 0, 0.25, 0.25)    // C5
    scheduleTone(audioCtx, 659, 0.18, 0.25, 0.22)  // E5
    scheduleTone(audioCtx, 784, 0.36, 0.5, 0.2)    // G5
  } catch {
    // ignore
  }
}
