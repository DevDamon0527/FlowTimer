import { useState, useEffect, useRef } from 'react'
import type { TimerStatus } from '../types/timer'
import {
  type AlarmSoundType,
  ALARM_SOUND_OPTIONS,
  resumeAudioContext,
  previewAlarmSound,
} from '../utils/audio'

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  studyMinutes:       number
  breakMinutes:       number
  alarmSound:         AlarmSoundType
  status:             TimerStatus
  onStudyChange:      (v: number) => void
  onBreakChange:      (v: number) => void
  onAlarmSoundChange: (v: AlarmSoundType) => void
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function SettingsPanel({
  studyMinutes,
  breakMinutes,
  alarmSound,
  status,
  onStudyChange,
  onBreakChange,
  onAlarmSoundChange,
}: Props) {
  const isRunning = status === 'running'

  // ── Local string state for numeric inputs ─────────────────────────────────
  // Keeps the field editable while partially typed (e.g., empty string)
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

  // ── Input handlers ────────────────────────────────────────────────────────

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

  // ── Sound preview ─────────────────────────────────────────────────────────
  // Must call resumeAudioContext first to satisfy browser autoplay policy

  function handlePreview() {
    resumeAudioContext()
    previewAlarmSound()
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="settings-panel" aria-label="타이머 설정">

      {/* Study duration */}
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

      {/* Break duration */}
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

      {/* Alarm sound selector + preview */}
      <div className="settings-row">
        <label className="settings-label" htmlFor="input-alarm">알람음</label>
        <div className="settings-input-group settings-alarm-group">
          <select
            id="input-alarm"
            className="settings-select"
            value={alarmSound}
            onChange={(e) => onAlarmSoundChange(e.target.value as AlarmSoundType)}
            aria-label="알람음 선택"
          >
            {ALARM_SOUND_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {/* Preview button — plays the currently selected sound */}
          <button
            type="button"
            className="settings-preview-btn"
            onClick={handlePreview}
            aria-label="알람음 미리 듣기"
            title="미리 듣기"
          >
            ▶
          </button>
        </div>
      </div>

    </div>
  )
}
