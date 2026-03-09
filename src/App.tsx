import { useState, useEffect, useCallback } from 'react'
import { useTimer } from './hooks/useTimer'
import { useTheme } from './hooks/useTheme'
import { useStats } from './hooks/useStats'
import { useTitleFavicon } from './hooks/useTitleFavicon'
import { minutesToMs } from './utils/format'
import { resumeAudioContext, setSoundEnabled } from './utils/audio'
import TimerDisplay from './components/TimerDisplay'
import PhaseInfo from './components/PhaseInfo'
import TimerControls from './components/TimerControls'
import SettingsPanel from './components/SettingsPanel'
import ModeTabs from './components/ModeTabs'
import StatsPanel from './components/StatsPanel'

// ── Icon components (inline SVG, no external deps) ──────────────────────────

function SunIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2"  x2="12" y2="6" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="4.22" y1="4.22" x2="7.05" y2="7.05" />
      <line x1="16.95" y1="16.95" x2="19.78" y2="19.78" />
      <line x1="2"  y1="12" x2="6"  y2="12" />
      <line x1="18" y1="12" x2="22" y2="12" />
      <line x1="4.22" y1="19.78" x2="7.05" y2="16.95" />
      <line x1="16.95" y1="7.05" x2="19.78" y2="4.22" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

function SoundOnIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  )
}

function SoundOffIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9"  x2="17" y2="15" />
      <line x1="17" y1="9"  x2="23" y2="15" />
    </svg>
  )
}

// ── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const { state, dispatch, getRemainingMs } = useTimer()
  const { theme, toggle: toggleTheme } = useTheme()
  const { stats } = useStats(state)

  const [soundEnabled, setSoundEnabledState] = useState<boolean>(() => {
    try { return localStorage.getItem('focus-timer-sound') !== 'false' } catch { return true }
  })

  // Keep audio module in sync
  useEffect(() => {
    setSoundEnabled(soundEnabled)
    try { localStorage.setItem('focus-timer-sound', String(soundEnabled)) } catch { /* ignore */ }
  }, [soundEnabled])

  // Title + favicon (replaces the old document.title in useTimer)
  useTitleFavicon(state, getRemainingMs)

  // displayMs drives the UI countdown at 10fps
  const [displayMs, setDisplayMs] = useState(() => getRemainingMs())
  useEffect(() => {
    setDisplayMs(getRemainingMs())
    if (state.status !== 'running') return
    const id = setInterval(() => setDisplayMs(getRemainingMs()), 100)
    return () => clearInterval(id)
  }, [state.status, state.endTime, state.remainingMs, getRemainingMs])

  const totalMs = minutesToMs(
    state.phase === 'study' ? state.studyMinutes : state.breakMinutes,
  )

  // Only show "next phase" hint in cycle mode
  const nextPhaseDuration =
    state.mode === 'cycle'
      ? state.phase === 'study'
        ? state.breakMinutes
        : state.studyMinutes
      : null

  const handleStart = useCallback(() => {
    resumeAudioContext()
    dispatch({ type: 'START' })
  }, [dispatch])

  const handlePause   = useCallback(() => dispatch({ type: 'PAUSE' }),   [dispatch])
  const handleResume  = useCallback(() => { resumeAudioContext(); dispatch({ type: 'RESUME' }) }, [dispatch])
  const handleReset   = useCallback(() => dispatch({ type: 'RESET' }),   [dispatch])

  return (
    <div className={`app app--${state.phase}`}>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="app-header">
        <h1 className="app-title">{state.title || '집중 타이머'}</h1>
        <div className="header-actions">
          <button
            className={`icon-btn${!soundEnabled ? ' icon-btn--off' : ''}`}
            onClick={() => setSoundEnabledState((v) => !v)}
            aria-label={soundEnabled ? '알람 끄기' : '알람 켜기'}
            title={soundEnabled ? '알람 끄기' : '알람 켜기'}
          >
            {soundEnabled ? <SoundOnIcon /> : <SoundOffIcon />}
          </button>
          <button
            className="icon-btn"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
            title={theme === 'dark' ? '라이트 모드' : '다크 모드'}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────────────────── */}
      <main className="app-main">
        <ModeTabs
          mode={state.mode}
          onChange={(mode) => dispatch({ type: 'SET_MODE', payload: mode })}
          disabled={state.status !== 'idle'}
        />

        <PhaseInfo
          phase={state.phase}
          mode={state.mode}
          cycle={state.cycle}
          status={state.status}
          nextPhaseDuration={nextPhaseDuration}
        />

        <TimerDisplay displayMs={displayMs} totalMs={totalMs} phase={state.phase} />

        <TimerControls
          status={state.status}
          onStart={handleStart}
          onPause={handlePause}
          onResume={handleResume}
          onReset={handleReset}
        />
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="app-footer">
        <StatsPanel todayMs={stats.todayMs} totalMs={stats.totalMs} />
        <SettingsPanel
          studyMinutes={state.studyMinutes}
          breakMinutes={state.breakMinutes}
          title={state.title}
          status={state.status}
          onStudyChange={(v) => dispatch({ type: 'SET_STUDY_MINUTES', payload: v })}
          onBreakChange={(v) => dispatch({ type: 'SET_BREAK_MINUTES', payload: v })}
          onTitleChange={(v) => dispatch({ type: 'SET_TITLE', payload: v })}
        />
      </footer>
    </div>
  )
}
