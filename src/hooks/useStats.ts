import { useState, useEffect, useRef } from 'react'
import type { TimerState } from '../types/timer'

// ── Types ────────────────────────────────────────────────────────────────────

interface Stats {
  todayDate:    string  // 'YYYY-MM-DD' — triggers today-reset when date changes
  todayFocusMs: number  // today's accumulated study (focus) time
  todayBreakMs: number  // today's accumulated break time
  todayTotalMs: number  // todayFocusMs + todayBreakMs (always kept in sync)
}

// v2 key — avoids reading stale v1 data that had different shape
const STATS_KEY = 'focus-timer-stats-v2'

// ── Storage helpers ───────────────────────────────────────────────────────────

function getTodayDate(): string {
  return new Date().toISOString().slice(0, 10)
}

function emptyStats(): Stats {
  return { todayDate: getTodayDate(), todayFocusMs: 0, todayBreakMs: 0, todayTotalMs: 0 }
}

function loadStats(): Stats {
  try {
    const raw = localStorage.getItem(STATS_KEY)
    if (!raw) return emptyStats()
    const parsed = JSON.parse(raw) as Stats
    // Day rolled over → reset today counters (history intentionally not kept)
    if (parsed.todayDate !== getTodayDate()) return emptyStats()
    return parsed
  } catch {
    return emptyStats()
  }
}

function saveStats(stats: Stats): void {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats))
  } catch {
    // ignore (private browsing / storage full)
  }
}

/**
 * Add elapsed milliseconds to the correct bucket and recompute total.
 * Also handles mid-session day rollover.
 */
function addElapsed(prev: Stats, elapsed: number, bucket: 'focus' | 'break'): Stats {
  const today = getTodayDate()
  // If the date changed while the timer was running, start fresh for today
  const base: Stats =
    prev.todayDate === today
      ? prev
      : { todayDate: today, todayFocusMs: 0, todayBreakMs: 0, todayTotalMs: 0 }

  const focusMs = base.todayFocusMs + (bucket === 'focus' ? elapsed : 0)
  const breakMs = base.todayBreakMs + (bucket === 'break' ? elapsed : 0)
  return {
    todayDate:    today,
    todayFocusMs: focusMs,
    todayBreakMs: breakMs,
    todayTotalMs: focusMs + breakMs,
  }
}

// ── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Tracks today's focus time and break time separately.
 *
 * Accumulation rules:
 *   Focus bucket:  mode==='focus' + running
 *                  mode==='cycle' + phase==='study' + running
 *   Break bucket:  mode==='break' + running
 *                  mode==='cycle' + phase==='break' + running
 *
 * Double-counting is prevented by detecting exact false→true transitions.
 * Pause / resume / reset are all handled correctly because the refs track
 * only the live session start timestamp.
 */
export function useStats(state: TimerState) {
  const [stats, setStats] = useState<Stats>(loadStats)

  // Keep a ref so the beforeunload handler always sees the latest stats
  const statsRef = useRef(stats)
  statsRef.current = stats

  // Separate session start timestamps for each bucket
  const focusSessionStartRef = useRef<number | null>(null)
  const breakSessionStartRef = useRef<number | null>(null)

  // ── Derived accumulating flags ────────────────────────────────────────────

  const isFocusAccumulating =
    state.status === 'running' &&
    (state.mode === 'focus' ||
      (state.mode === 'cycle' && state.phase === 'study'))

  const isBreakAccumulating =
    state.status === 'running' &&
    (state.mode === 'break' ||
      (state.mode === 'cycle' && state.phase === 'break'))

  const prevFocusRef = useRef(isFocusAccumulating)
  const prevBreakRef = useRef(isBreakAccumulating)

  // ── Focus accumulation transitions ───────────────────────────────────────

  useEffect(() => {
    const was = prevFocusRef.current
    prevFocusRef.current = isFocusAccumulating

    if (!was && isFocusAccumulating) {
      // Started accumulating: record session start
      focusSessionStartRef.current = Date.now()
    } else if (was && !isFocusAccumulating) {
      // Stopped accumulating: flush elapsed time
      if (focusSessionStartRef.current !== null) {
        const elapsed = Date.now() - focusSessionStartRef.current
        focusSessionStartRef.current = null
        setStats((prev) => addElapsed(prev, elapsed, 'focus'))
      }
    }
  }, [isFocusAccumulating])

  // ── Break accumulation transitions ────────────────────────────────────────

  useEffect(() => {
    const was = prevBreakRef.current
    prevBreakRef.current = isBreakAccumulating

    if (!was && isBreakAccumulating) {
      breakSessionStartRef.current = Date.now()
    } else if (was && !isBreakAccumulating) {
      if (breakSessionStartRef.current !== null) {
        const elapsed = Date.now() - breakSessionStartRef.current
        breakSessionStartRef.current = null
        setStats((prev) => addElapsed(prev, elapsed, 'break'))
      }
    }
  }, [isBreakAccumulating])

  // ── Persist to localStorage ───────────────────────────────────────────────

  useEffect(() => {
    saveStats(stats)
  }, [stats])

  // ── Flush on page unload (tab close / navigation) ─────────────────────────

  useEffect(() => {
    const handleUnload = () => {
      let s = statsRef.current
      // Flush any in-progress focus session
      if (focusSessionStartRef.current !== null) {
        const elapsed = Date.now() - focusSessionStartRef.current
        s = addElapsed(s, elapsed, 'focus')
      }
      // Flush any in-progress break session
      if (breakSessionStartRef.current !== null) {
        const elapsed = Date.now() - breakSessionStartRef.current
        s = addElapsed(s, elapsed, 'break')
      }
      saveStats(s)
    }
    window.addEventListener('beforeunload', handleUnload)
    return () => window.removeEventListener('beforeunload', handleUnload)
  }, [])

  return { stats }
}
