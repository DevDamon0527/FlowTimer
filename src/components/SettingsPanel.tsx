import { useState, useEffect, useRef } from 'react'
import type { TimerStatus } from '../types/timer'

interface Props {
  studyMinutes: number
  breakMinutes: number
  title: string
  status: TimerStatus
  onStudyChange: (v: number) => void
  onBreakChange: (v: number) => void
  onTitleChange: (v: string) => void
}

export default function SettingsPanel({
  studyMinutes,
  breakMinutes,
  title,
  status,
  onStudyChange,
  onBreakChange,
  onTitleChange,
}: Props) {
  const isRunning = status === 'running'

  // Local string state — allows empty string during editing
  const [studyStr, setStudyStr] = useState(String(studyMinutes))
  const [breakStr, setBreakStr] = useState(String(breakMinutes))

  // Sync display when parent value changes from outside (e.g., on mount from localStorage)
  const prevStudy = useRef(studyMinutes)
  const prevBreak = useRef(breakMinutes)
  useEffect(() => {
    if (prevStudy.current !== studyMinutes) {
      prevStudy.current = studyMinutes
      setStudyStr(String(studyMinutes))
    }
  }, [studyMinutes])
  useEffect(() => {
    if (prevBreak.current !== breakMinutes) {
      prevBreak.current = breakMinutes
      setBreakStr(String(breakMinutes))
    }
  }, [breakMinutes])

  function handleStudyChange(value: string) {
    setStudyStr(value)
    const num = parseInt(value, 10)
    if (!isNaN(num) && num >= 1) onStudyChange(num)
  }

  function handleBreakChange(value: string) {
    setBreakStr(value)
    const num = parseInt(value, 10)
    if (!isNaN(num) && num >= 1) onBreakChange(num)
  }

  // On blur: revert to last valid value if the current string is invalid
  function handleStudyBlur() {
    const num = parseInt(studyStr, 10)
    if (isNaN(num) || num < 1) setStudyStr(String(studyMinutes))
  }

  function handleBreakBlur() {
    const num = parseInt(breakStr, 10)
    if (isNaN(num) || num < 1) setBreakStr(String(breakMinutes))
  }

  return (
    <div className="settings-panel" aria-label="타이머 설정">
      <div className="settings-row">
        <label className="settings-label" htmlFor="input-study">공부</label>
        <div className="settings-input-group">
          <input
            id="input-study"
            type="number"
            className="settings-input settings-input--number"
            value={studyStr}
            min={1}
            max={999}
            disabled={isRunning}
            onChange={(e) => handleStudyChange(e.target.value)}
            onBlur={handleStudyBlur}
            aria-label="공부 시간 (분)"
          />
          <span className="settings-unit">분</span>
        </div>
      </div>

      <div className="settings-sep" aria-hidden="true" />

      <div className="settings-row">
        <label className="settings-label" htmlFor="input-break">쉬기</label>
        <div className="settings-input-group">
          <input
            id="input-break"
            type="number"
            className="settings-input settings-input--number"
            value={breakStr}
            min={1}
            max={999}
            disabled={isRunning}
            onChange={(e) => handleBreakChange(e.target.value)}
            onBlur={handleBreakBlur}
            aria-label="쉬는 시간 (분)"
          />
          <span className="settings-unit">분</span>
        </div>
      </div>

      <div className="settings-sep" aria-hidden="true" />

      <div className="settings-row">
        <label className="settings-label" htmlFor="input-title">제목</label>
        <input
          id="input-title"
          type="text"
          className="settings-input settings-input--title"
          value={title}
          maxLength={30}
          onChange={(e) => onTitleChange(e.target.value)}
          aria-label="타이머 제목"
          placeholder="집중 타이머"
        />
      </div>
    </div>
  )
}
