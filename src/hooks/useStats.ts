import { useState, useEffect, useRef } from 'react'
import type { TimerState } from '../types/timer'

interface Stats {
  todayDate: string  // 'YYYY-MM-DD'
  todayMs: number
  totalMs: number
}

const STATS_KEY = 'focus-timer-stats-v1'

function getTodayDate(): string {
  return new Date().toISOString().slice(0, 10)
}

function loadStats(): Stats {
  try {
    const raw = localStorage.getItem(STATS_KEY)
    if (!raw) return { todayDate: getTodayDate(), todayMs: 0, totalMs: 0 }
    const parsed = JSON.parse(raw) as Stats
    // Day rolled over — reset today but keep total
    if (parsed.todayDate !== getTodayDate()) {
      return { todayDate: getTodayDate(), todayMs: 0, totalMs: parsed.totalMs }
    }
    return parsed
  } catch {
    return { todayDate: getTodayDate(), todayMs: 0, totalMs: 0 }
  }
}

function saveStats(stats: Stats): void {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats))
  } catch {
    // ignore
  }
}

function addElapsed(prev: Stats, elapsed: number): Stats {
  const today = getTodayDate()
  const base =
    prev.todayDate === today
      ? prev
      : { todayDate: today, todayMs: 0, totalMs: prev.totalMs }
  return {
    todayDate: today,
    todayMs: base.todayMs + elapsed,
    totalMs: base.totalMs + elapsed,
  }
}

/**
 * Accumulates study (focus) time:
 * - cycle mode + study phase + running
 * - focus mode + running
 * Break mode and break phase in cycle mode are NOT counted.
 */
export function useStats(state: TimerState) {
  const [stats, setStats] = useState<Stats>(loadStats)
  const statsRef = useRef(stats)
  const sessionStartRef = useRef<number | null>(null)

  statsRef.current = stats

  const isAccumulating =
    state.status === 'running' &&
    (state.mode === 'focus' ||
      (state.mode === 'cycle' && state.phase === 'study'))

  const prevAccumulatingRef = useRef(isAccumulating)

  // Detect transitions: idle/paused → accumulating, or accumulating → idle/paused
  useEffect(() => {
    const wasAccumulating = prevAccumulatingRef.current
    prevAccumulatingRef.current = isAccumulating

    if (!wasAccumulating && isAccumulating) {
      sessionStartRef.current = Date.now()
    } else if (wasAccumulating && !isAccumulating) {
      if (sessionStartRef.current !== null) {
        const elapsed = Date.now() - sessionStartRef.current
        sessionStartRef.current = null
        setStats((prev) => addElapsed(prev, elapsed))
      }
    }
  }, [isAccumulating])

  // Persist to localStorage whenever stats change
  useEffect(() => {
    saveStats(stats)
  }, [stats])

  // Flush on page unload (tab close / navigation)
  useEffect(() => {
    const handleUnload = () => {
      if (sessionStartRef.current !== null) {
        const elapsed = Date.now() - sessionStartRef.current
        saveStats(addElapsed(statsRef.current, elapsed))
      }
    }
    window.addEventListener('beforeunload', handleUnload)
    return () => window.removeEventListener('beforeunload', handleUnload)
  }, [])

  return { stats }
}
