import type { Phase, TimerMode, TimerStatus } from '../types/timer'

// ── Constants ─────────────────────────────────────────────────────────────────

/** Human-readable labels shown in the "mode" meta row */
const MODE_LABELS: Record<TimerMode, string> = {
  cycle: '사이클 모드',
  focus: '공부 전용',
  break: '쉬기 전용',
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  phase:        Phase
  mode:         TimerMode
  cycle:        number
  status:       TimerStatus
  studyMinutes: number   // used to show upcoming study duration
  breakMinutes: number   // used to show upcoming break duration
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function PhaseInfo({
  phase,
  mode,
  cycle,
  status,
  studyMinutes,
  breakMinutes,
}: Props) {
  // Current phase display
  const phaseLabel = phase === 'study' ? '공부 중' : '쉬는 시간'

  // Next phase — only meaningful in cycle mode while running/paused
  const showNext  = mode === 'cycle' && status !== 'idle'
  const nextPhase: Phase    = phase === 'study' ? 'break' : 'study'
  const nextLabel           = nextPhase === 'break' ? '쉬는 시간' : '공부 시간'
  const nextDuration        = nextPhase === 'break' ? breakMinutes : studyMinutes

  return (
    <div className="phase-card" role="status" aria-live="polite">

      {/* ── Meta row: mode label + cycle badge ─────────────────────────── */}
      <div className="phase-card__meta">
        <span className="phase-card__mode">{MODE_LABELS[mode]}</span>
        {mode === 'cycle' && (
          <span className="phase-card__cycle">사이클 {cycle}</span>
        )}
      </div>

      {/* ── Current phase badge (large) ─────────────────────────────────── */}
      <div className="phase-card__phase">
        <div className={`phase-badge phase-badge--${phase}`}>
          {phaseLabel}
        </div>
      </div>

      {/* ── Next step hint ───────────────────────────────────────────────── */}
      {/*
        Always rendered (even when hidden) so the card height stays stable.
        `phase-card__next--hidden` makes it invisible but keeps the space.
      */}
      <div className={`phase-card__next${showNext ? '' : ' phase-card__next--hidden'}`} aria-hidden={!showNext}>
        <span className="phase-card__next-arrow">다음</span>
        <span className="phase-card__next-chevron">›</span>
        <span className="phase-card__next-label">{nextLabel}</span>
        <span className="phase-card__next-duration">{nextDuration}분</span>
      </div>

    </div>
  )
}
