import { useReducer, useEffect, useRef, useCallback } from 'react'
import type { TimerState, TimerAction, Phase, TimerMode } from '../types/timer'
import { minutesToMs } from '../utils/format'
import { loadSettings, saveSettings } from '../utils/storage'
import { playTransitionSound, playCompletionSound } from '../utils/audio'

// ─── Initial State ──────────────────────────────────────────────────────────

function createInitialState(): TimerState {
  const stored = loadSettings()
  const studyMinutes = stored.studyMinutes ?? 40
  const breakMinutes = stored.breakMinutes ?? 20
  const title = stored.title ?? '집중 타이머'
  return {
    status: 'idle',
    phase: 'study',
    mode: 'cycle',
    cycle: 1,
    studyMinutes,
    breakMinutes,
    title,
    endTime: null,
    remainingMs: minutesToMs(studyMinutes),
  }
}

// ─── Reducer ────────────────────────────────────────────────────────────────

function reducer(state: TimerState, action: TimerAction): TimerState {
  switch (action.type) {
    case 'START': {
      if (state.status !== 'idle') return state
      return { ...state, status: 'running', endTime: Date.now() + state.remainingMs }
    }

    case 'PAUSE': {
      if (state.status !== 'running') return state
      return {
        ...state,
        status: 'paused',
        remainingMs: Math.max(0, (state.endTime ?? Date.now()) - Date.now()),
        endTime: null,
      }
    }

    case 'RESUME': {
      if (state.status !== 'paused') return state
      return { ...state, status: 'running', endTime: Date.now() + state.remainingMs }
    }

    case 'RESET': {
      const phase: Phase = state.mode === 'break' ? 'break' : 'study'
      return {
        ...state,
        status: 'idle',
        phase,
        cycle: 1,
        endTime: null,
        remainingMs: minutesToMs(phase === 'study' ? state.studyMinutes : state.breakMinutes),
      }
    }

    case 'ADVANCE_PHASE': {
      // Idempotency guard
      if (state.status !== 'running' || state.endTime === null) return state

      // Single-phase modes: finish instead of cycling
      if (state.mode === 'focus' || state.mode === 'break') {
        const phase: Phase = state.mode === 'break' ? 'break' : 'study'
        return {
          ...state,
          status: 'idle',
          endTime: null,
          remainingMs: minutesToMs(phase === 'study' ? state.studyMinutes : state.breakMinutes),
        }
      }

      // Cycle mode: advance to next phase
      const nextPhase: Phase = state.phase === 'study' ? 'break' : 'study'
      const nextCycle = nextPhase === 'study' ? state.cycle + 1 : state.cycle
      const nextMs = minutesToMs(
        nextPhase === 'study' ? state.studyMinutes : state.breakMinutes,
      )
      return {
        ...state,
        phase: nextPhase,
        cycle: nextCycle,
        endTime: Date.now() + nextMs,
        remainingMs: nextMs,
      }
    }

    case 'SET_MODE': {
      if (state.status !== 'idle') return state
      const mode: TimerMode = action.payload
      const phase: Phase = mode === 'break' ? 'break' : 'study'
      return {
        ...state,
        mode,
        phase,
        cycle: 1,
        remainingMs: minutesToMs(phase === 'study' ? state.studyMinutes : state.breakMinutes),
      }
    }

    case 'SET_STUDY_MINUTES': {
      const minutes = Math.max(1, Math.floor(action.payload))
      return {
        ...state,
        studyMinutes: minutes,
        remainingMs:
          state.status === 'idle' && state.phase === 'study'
            ? minutesToMs(minutes)
            : state.remainingMs,
      }
    }

    case 'SET_BREAK_MINUTES': {
      const minutes = Math.max(1, Math.floor(action.payload))
      return {
        ...state,
        breakMinutes: minutes,
        remainingMs:
          state.status === 'idle' && state.phase === 'break'
            ? minutesToMs(minutes)
            : state.remainingMs,
      }
    }

    case 'SET_TITLE': {
      return { ...state, title: action.payload }
    }
  }
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useTimer() {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState)

  const stateRef = useRef(state)
  stateRef.current = state

  const advancingRef = useRef(false)
  const singleModeCompletedRef = useRef(false)
  const rafRef = useRef<number | null>(null)

  // ── RAF loop + setInterval fallback ─────────────────────────────────────
  // RAF는 백그라운드 탭에서 중단되므로, setInterval을 백업으로 함께 실행.
  // 포그라운드: RAF(~60fps)가 처리 / 백그라운드: setInterval(~1s)이 처리
  // advancingRef 플래그로 양쪽이 동시에 디스패치하는 중복 실행 방지.
  useEffect(() => {
    const checkAdvance = () => {
      const s = stateRef.current

      if (s.status === 'running' && s.endTime !== null) {
        if (!advancingRef.current && Date.now() >= s.endTime) {
          advancingRef.current = true
          if (s.mode === 'focus' || s.mode === 'break') {
            singleModeCompletedRef.current = true
          }
          dispatch({ type: 'ADVANCE_PHASE' })
        } else if (advancingRef.current && Date.now() < s.endTime) {
          advancingRef.current = false
        }
      } else {
        advancingRef.current = false
      }
    }

    const tick = () => {
      checkAdvance()
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    const intervalId = setInterval(checkAdvance, 500)

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      clearInterval(intervalId)
    }
  }, [])

  // ── Cycle mode: phase transition sound ───────────────────────────────────
  const prevPhaseRef = useRef(state.phase)
  useEffect(() => {
    if (state.status === 'running' && prevPhaseRef.current !== state.phase) {
      playTransitionSound(state.phase)
    }
    prevPhaseRef.current = state.phase
  }, [state.phase, state.status])

  // ── Single mode: completion sound ────────────────────────────────────────
  useEffect(() => {
    if (state.status === 'idle' && singleModeCompletedRef.current) {
      singleModeCompletedRef.current = false
      playCompletionSound()
    }
  }, [state.status])

  // ── Persist settings ─────────────────────────────────────────────────────
  useEffect(() => {
    saveSettings({
      studyMinutes: state.studyMinutes,
      breakMinutes: state.breakMinutes,
      title: state.title,
    })
  }, [state.studyMinutes, state.breakMinutes, state.title])

  // NOTE: document.title is managed by useTitleFavicon in App.tsx

  const getRemainingMs = useCallback((): number => {
    if (state.status === 'running' && state.endTime !== null) {
      return Math.max(0, state.endTime - Date.now())
    }
    return state.remainingMs
  }, [state.status, state.endTime, state.remainingMs])

  return { state, dispatch, getRemainingMs }
}
