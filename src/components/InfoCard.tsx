import { formatFocusTime } from '../utils/format'
import type { Phase, TimerMode, TimerStatus } from '../types/timer'

// ── 상수 ──────────────────────────────────────────────────────────────────────

const MODE_LABELS: Record<TimerMode, string> = {
  cycle: '사이클 모드',
  focus: '공부 전용',
  break: '쉬기 전용',
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  // phase 정보 (기존 PhaseInfo)
  phase:        Phase
  mode:         TimerMode
  cycle:        number
  status:       TimerStatus
  studyMinutes: number
  breakMinutes: number
  // 오늘 통계 (기존 StatsPanel)
  todayFocusMs: number
  todayBreakMs: number
  todayTotalMs: number
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function InfoCard({
  phase, mode, cycle, status,
  studyMinutes, breakMinutes,
  todayFocusMs, todayBreakMs, todayTotalMs,
}: Props) {
  // 현재 phase 표시
  const phaseLabel = phase === 'study' ? '공부 중' : '쉬는 시간'

  // 다음 단계 — 사이클 모드 + 실행/일시정지 중일 때만 표시
  const showNext              = mode === 'cycle' && status !== 'idle'
  const nextPhase: Phase      = phase === 'study' ? 'break' : 'study'
  const nextLabel             = nextPhase === 'break' ? '쉬는 시간' : '공부 시간'
  const nextDuration          = nextPhase === 'break' ? breakMinutes : studyMinutes

  return (
    <div className="info-card" role="status" aria-live="polite">

      {/* ── 상단 메타: 모드 + 사이클 배지 ─────────────────────────────── */}
      <div className="info-card__meta">
        <span className="info-card__mode">{MODE_LABELS[mode]}</span>
        {mode === 'cycle' && (
          <span className="info-card__cycle">사이클 {cycle}</span>
        )}
      </div>

      {/* ── 본문: 왼쪽 현재 phase / 오른쪽 오늘 통계 ──────────────────── */}
      <div className="info-card__body">

        {/* 현재 phase 배지 */}
        <div className="info-card__phase-col">
          <div className={`phase-badge phase-badge--${phase}`}>
            {phaseLabel}
          </div>
        </div>

        <div className="info-card__divider" aria-hidden="true" />

        {/* 오늘 통계 — 보조 정보 */}
        <div className="info-card__stats-col" aria-label="오늘 시간 통계">
          <div className="info-card__stat">
            <span className="info-card__stat-label">공부</span>
            <span className="info-card__stat-value info-card__stat-value--study">
              {formatFocusTime(todayFocusMs)}
            </span>
          </div>
          <div className="info-card__stat-sep" />
          <div className="info-card__stat">
            <span className="info-card__stat-label">휴식</span>
            <span className="info-card__stat-value info-card__stat-value--break">
              {formatFocusTime(todayBreakMs)}
            </span>
          </div>
          <div className="info-card__stat-sep" />
          <div className="info-card__stat">
            <span className="info-card__stat-label">합산</span>
            <span className="info-card__stat-value">
              {formatFocusTime(todayTotalMs)}
            </span>
          </div>
        </div>

      </div>

      {/* ── 하단: 다음 단계 힌트 (항상 렌더링, hidden 시 opacity 0) ────── */}
      <div
        className={`info-card__next${showNext ? '' : ' info-card__next--hidden'}`}
        aria-hidden={!showNext}
      >
        <span className="info-card__next-prefix">다음</span>
        <div className={`info-card__next-badge info-card__next-badge--${nextPhase}`}>
          <span>{nextLabel}</span>
          <span className="info-card__next-badge-dot">·</span>
          <span className="info-card__next-badge-duration">{nextDuration}분</span>
        </div>
      </div>

    </div>
  )
}
