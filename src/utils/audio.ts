import type { Phase } from '../types/timer'

// ── Types ────────────────────────────────────────────────────────────────────

/**
 * Available alarm sound presets.
 * To add a new preset:
 *   1. Add a new value here
 *   2. Add a label in ALARM_SOUND_OPTIONS
 *   3. Implement the play function and add a case in playTransitionSound
 */
export type AlarmSoundType = 'beep1' | 'beep2' | 'softBell' | 'digitalTone'

export const ALARM_SOUND_OPTIONS: { value: AlarmSoundType; label: string }[] = [
  { value: 'beep1',       label: 'Beep 1' },
  { value: 'beep2',       label: 'Beep 2' },
  { value: 'softBell',    label: 'Soft Bell' },
  { value: 'digitalTone', label: 'Digital' },
]

// ── Module-level state ───────────────────────────────────────────────────────

let ctx: AudioContext | null = null
let _soundEnabled = true
let _alarmSound: AlarmSoundType = 'beep1'
let _lastPlayTime = 0
const DEBOUNCE_MS = 600

// ── AudioContext lifecycle ───────────────────────────────────────────────────

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

// ── Settings ─────────────────────────────────────────────────────────────────

/** Toggle sound on/off globally — persisted by the caller */
export function setSoundEnabled(enabled: boolean): void {
  _soundEnabled = enabled
}

/** Set the active alarm sound preset */
export function setAlarmSound(type: AlarmSoundType): void {
  _alarmSound = type
}

/** Get the active alarm sound preset */
export function getAlarmSound(): AlarmSoundType {
  return _alarmSound
}

// ── Internal helpers ─────────────────────────────────────────────────────────

/** Returns true if sound can play (enabled + debounce passed) */
function canPlay(): boolean {
  if (!_soundEnabled) return false
  const now = Date.now()
  if (now - _lastPlayTime < DEBOUNCE_MS) return false
  _lastPlayTime = now
  return true
}

/**
 * Schedule a single oscillator tone.
 * @param type - OscillatorType (default 'sine')
 */
function scheduleTone(
  audioCtx: AudioContext,
  frequency: number,
  startOffset: number,
  duration: number,
  volume: number,
  type: OscillatorType = 'sine',
): void {
  const osc = audioCtx.createOscillator()
  const gain = audioCtx.createGain()
  osc.connect(gain)
  gain.connect(audioCtx.destination)

  osc.type = type
  osc.frequency.value = frequency

  const t = audioCtx.currentTime + startOffset
  gain.gain.setValueAtTime(0, t)
  gain.gain.linearRampToValueAtTime(volume, t + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration)

  osc.start(t)
  osc.stop(t + duration + 0.01)
}

// ── Preset implementations ───────────────────────────────────────────────────

/**
 * beep1 — gentle two-tone (original default)
 * study → break: descending (signal to relax)
 * break → study: ascending (signal to focus)
 */
function playBeep1(audioCtx: AudioContext, phase: Phase): void {
  if (phase === 'break') {
    scheduleTone(audioCtx, 784, 0,   0.3, 0.25)
    scheduleTone(audioCtx, 659, 0.2, 0.4, 0.2)
  } else {
    scheduleTone(audioCtx, 659, 0,   0.3, 0.2)
    scheduleTone(audioCtx, 784, 0.2, 0.4, 0.25)
  }
}

/**
 * beep2 — short, crisp double-blip
 * Higher pitch for break→study (attention), lower for study→break (softer)
 */
function playBeep2(audioCtx: AudioContext, phase: Phase): void {
  const freq = phase === 'break' ? 440 : 880
  scheduleTone(audioCtx, freq, 0,   0.12, 0.3)
  scheduleTone(audioCtx, freq, 0.2, 0.12, 0.25)
}

/**
 * softBell — single mellow bell-like tone with slow natural decay
 * C5 for break (calming), E5 for study (gentle alert)
 */
function playSoftBell(audioCtx: AudioContext, phase: Phase): void {
  const freq = phase === 'break' ? 523 : 659   // C5 or E5
  const osc  = audioCtx.createOscillator()
  const gain = audioCtx.createGain()
  osc.connect(gain)
  gain.connect(audioCtx.destination)

  osc.type = 'sine'
  osc.frequency.value = freq

  const t = audioCtx.currentTime
  gain.gain.setValueAtTime(0.35, t)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.5)
  osc.start(t)
  osc.stop(t + 1.55)
}

/**
 * digitalTone — retro square-wave blip
 * study → break: descending steps, break → study: ascending steps
 */
function playDigitalTone(audioCtx: AudioContext, phase: Phase): void {
  if (phase === 'break') {
    scheduleTone(audioCtx, 600, 0,    0.1, 0.15, 'square')
    scheduleTone(audioCtx, 400, 0.15, 0.1, 0.15, 'square')
  } else {
    scheduleTone(audioCtx, 400, 0,    0.1, 0.15, 'square')
    scheduleTone(audioCtx, 600, 0.15, 0.1, 0.15, 'square')
    scheduleTone(audioCtx, 800, 0.30, 0.1, 0.15, 'square')
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Play the selected transition sound when phase changes.
 * Respects sound on/off toggle and debounce guard.
 */
export function playTransitionSound(phase: Phase): void {
  if (!canPlay()) return
  const audioCtx = getCtx()
  if (!audioCtx) return

  try {
    switch (_alarmSound) {
      case 'beep1':       playBeep1(audioCtx, phase);       break
      case 'beep2':       playBeep2(audioCtx, phase);       break
      case 'softBell':    playSoftBell(audioCtx, phase);    break
      case 'digitalTone': playDigitalTone(audioCtx, phase); break
    }
  } catch {
    // ignore AudioContext errors
  }
}

/** Three-tone completion chime played when a single-phase mode finishes */
export function playCompletionSound(): void {
  if (!canPlay()) return
  const audioCtx = getCtx()
  if (!audioCtx) return

  try {
    scheduleTone(audioCtx, 523, 0,    0.25, 0.25)  // C5
    scheduleTone(audioCtx, 659, 0.18, 0.25, 0.22)  // E5
    scheduleTone(audioCtx, 784, 0.36, 0.5,  0.2)   // G5
  } catch {
    // ignore
  }
}

/**
 * Preview the currently selected sound, ignoring the on/off toggle.
 * Useful for the settings UI "try it" button.
 * Still respects the debounce guard to prevent rapid retriggers.
 */
export function previewAlarmSound(): void {
  const now = Date.now()
  if (now - _lastPlayTime < DEBOUNCE_MS) return
  _lastPlayTime = now

  const audioCtx = getCtx()
  if (!audioCtx) return

  try {
    switch (_alarmSound) {
      case 'beep1':       playBeep1(audioCtx, 'study');       break
      case 'beep2':       playBeep2(audioCtx, 'study');       break
      case 'softBell':    playSoftBell(audioCtx, 'study');    break
      case 'digitalTone': playDigitalTone(audioCtx, 'study'); break
    }
  } catch {
    // ignore
  }
}
