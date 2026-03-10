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
  phase:        Phase
  mode:         TimerMode
  cycle:        number
  status:       TimerStatus
  studyMinutes: number
  breakMinutes: number
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
  const phaseLabel   = phase === 'study' ? '공부 중' : '쉬는 시간'
  const isCycleMode  = mode === 'cycle'
  const isActive     = status !== 'idle'

  // 다음 단계 계산 — visibility 제어용이므로 모든 모드에서 계산
  const nextPhase: Phase = phase === 'study' ? 'break' : 'study'
  const nextLabel        = nextPhase === 'break' ? '쉬는 시간' : '공부 시간'
  const nextDuration     = nextPhase === 'break' ? breakMinutes : studyMinutes

  // 다음 단계 배지 스타일:
  //   실행 중 → 해당 phase 컬러 배지
  //   대기 중 → 뮤트 배지 (같은 크기, 다른 색상)
  const nextBadgeClass = isActive
    ? `info-card__next-badge info-card__next-badge--${nextPhase}`
    : 'info-card__next-badge info-card__next-badge--idle'

  return (
    <div className="info-card" role="status" aria-live="polite">

      {/* ── 상단 메타 ───────────────────────────────────────────────────── */}
      {/*
        사이클 배지를 항상 DOM에 유지하고 visibility로 표시 여부를 제어한다.
        conditional render 시 meta 높이가 바뀌는 레이아웃 시프트를 방지.
      */}
      <div className="info-card__meta">
        <span className="info-card__mode">{MODE_LABELS[mode]}</span>
        <span
          className="info-card__cycle"
          style={{ visibility: isCycleMode ? 'visible' : 'hidden' }}
          aria-hidden={!isCycleMode}
        >
          사이클 {cycle}
        </span>
      </div>

      {/* ── 본문: 왼쪽 phase + 힌트 / 오른쪽 통계 ─────────────────────── */}
      <div className="info-card__body">

        {/* 왼쪽: 현재 phase 배지 + 다음 단계 힌트 */}
        <div className="info-card__phase-col">
          <div className={`phase-badge phase-badge--${phase}`}>
            <span className="phase-badge__dot" aria-hidden="true" />
            <span className="phase-badge__text">{phaseLabel}</span>
          </div>

          {/*
            사이클 힌트를 항상 DOM에 렌더링하고 visibility로 제어.
            → 사이클/비사이클 모드 전환 시 phase-col 높이가 유지됨.
            실행 중: 컬러 배지 / 대기 중: 뮤트 배지 (동일 크기)
          */}
          <div
            className="info-card__phase-hint"
            style={{ visibility: isCycleMode ? 'visible' : 'hidden' }}
            aria-hidden={!isCycleMode}
          >
            <div className={nextBadgeClass}>
              <span>{nextLabel}</span>
              <span className="info-card__next-badge-dot">·</span>
              <span className="info-card__next-badge-duration">{nextDuration}분</span>
            </div>
          </div>
        </div>

        <div className="info-card__divider" aria-hidden="true" />

        {/* 오른쪽: 오늘 통계 — 보조 정보 */}
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

    </div>
  )
}
