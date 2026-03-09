export type Phase = 'study' | 'break'
export type TimerStatus = 'idle' | 'running' | 'paused'
export type TimerMode = 'cycle' | 'focus' | 'break'

export interface TimerState {
  status: TimerStatus
  phase: Phase
  mode: TimerMode
  cycle: number
  studyMinutes: number
  breakMinutes: number
  title: string
  // endTime: timestamp when current phase ends — only valid when status === 'running'
  endTime: number | null
  // remainingMs: authoritative when paused/idle, snapshot seed when starting/resuming
  remainingMs: number
}

export type TimerAction =
  | { type: 'START' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'RESET' }
  | { type: 'ADVANCE_PHASE' }
  | { type: 'SET_MODE'; payload: TimerMode }
  | { type: 'SET_STUDY_MINUTES'; payload: number }
  | { type: 'SET_BREAK_MINUTES'; payload: number }
  | { type: 'SET_TITLE'; payload: string }
