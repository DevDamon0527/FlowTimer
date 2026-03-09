import type { Phase, TimerMode, TimerStatus } from '../types/timer'

interface Props {
  phase: Phase
  mode: TimerMode
  cycle: number
  status: TimerStatus
  nextPhaseDuration: number | null  // null for single-phase modes
}

export default function PhaseInfo({ phase, mode, cycle, status, nextPhaseDuration }: Props) {
  const phaseLabel = phase === 'study' ? '공부 중' : '쉬는 시간'
  const nextPhaseLabel = phase === 'study' ? '쉬는 시간' : '공부 시간'

  return (
    <div className="phase-info" role="status" aria-live="polite">
      <div className={`phase-badge phase-badge--${phase}`}>
        {phaseLabel}
      </div>
      {mode === 'cycle' && (
        <div className="cycle-count">사이클 {cycle}</div>
      )}
      {status !== 'idle' && nextPhaseDuration !== null && (
        <div className="next-hint">
          다음 → {nextPhaseLabel} {nextPhaseDuration}분
        </div>
      )}
    </div>
  )
}
