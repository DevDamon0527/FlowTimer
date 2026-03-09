import type { TimerStatus } from '../types/timer'

interface Props {
  status: TimerStatus
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onReset: () => void
}

export default function TimerControls({ status, onStart, onPause, onResume, onReset }: Props) {
  return (
    <div className="timer-controls" role="group" aria-label="타이머 컨트롤">
      {status === 'idle' && (
        <button className="btn btn--primary" onClick={onStart} aria-label="타이머 시작">
          시작
        </button>
      )}

      {status === 'running' && (
        <button className="btn btn--secondary" onClick={onPause} aria-label="타이머 일시정지">
          일시정지
        </button>
      )}

      {status === 'paused' && (
        <button className="btn btn--primary" onClick={onResume} aria-label="타이머 재개">
          재개
        </button>
      )}

      {status !== 'idle' && (
        <button className="btn btn--ghost" onClick={onReset} aria-label="타이머 초기화">
          초기화
        </button>
      )}
    </div>
  )
}
