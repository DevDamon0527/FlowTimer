import { useEffect, useRef } from 'react'
import type { TimerState } from '../types/timer'
import { setFavicon } from '../utils/favicon'

// ── Constants — adjust thresholds here ──────────────────────────────────────
const WARNING_THRESHOLD_MS = 60_000  // start warning blink at 60 s remaining

const COLORS = {
  study:        '#6366f1',  // indigo
  break:        '#10b981',  // emerald
  studyWarning: '#ef4444',  // red — "study phase ending soon"
  breakWarning: '#3b82f6',  // blue — "break phase ending soon"
} as const

export function useTitleFavicon(state: TimerState, getRemainingMs: () => number) {
  const blinkRef = useRef(false)

  useEffect(() => {
    if (state.status === 'idle') {
      blinkRef.current = false
      document.title = state.title || '집중 타이머'
      setFavicon(state.phase === 'study' ? COLORS.study : COLORS.break)
      return
    }

    const phaseColor   = state.phase === 'study' ? COLORS.study        : COLORS.break
    const warnColor    = state.phase === 'study' ? COLORS.studyWarning  : COLORS.breakWarning
    const phaseStr     = state.phase === 'study' ? '공부 중'             : '쉬는 시간'

    const update = () => {
      const ms = getRemainingMs()
      const isWarning = state.status === 'running' && ms <= WARNING_THRESHOLD_MS

      const totalSec = Math.max(0, Math.ceil(ms / 1000))
      const m = String(Math.floor(totalSec / 60)).padStart(2, '0')
      const s = String(totalSec % 60).padStart(2, '0')
      const timeStr = `${m}:${s}`

      if (isWarning) {
        blinkRef.current = !blinkRef.current
        const prefix = blinkRef.current ? '● ' : '  '
        document.title = `${prefix}${timeStr} · ${phaseStr}`
        setFavicon(blinkRef.current ? warnColor : phaseColor)
      } else {
        blinkRef.current = false
        document.title = `${timeStr} · ${phaseStr}`
        setFavicon(phaseColor)
      }
    }

    update()
    const id = setInterval(update, 500)
    return () => clearInterval(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status, state.phase, state.endTime, state.remainingMs, state.title])

  // Restore title on unmount
  useEffect(() => {
    return () => {
      document.title = '집중 타이머'
    }
  }, [])
}
