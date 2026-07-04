import { useEffect, useState } from 'react'
import './ScanProgress.css'

const STAGES = [
  'Uploading APK to server',
  'Parsing manifest & permissions',
  'Scanning archive for embedded URLs',
  'Inspecting bytecode for suspicious APIs',
  'Calculating risk score',
  'Generating plain-language report',
]

// Real backend work is a single blocking call, so this cycles through
// realistic stage labels on a timer purely for feedback. It never claims
// completion before the actual response arrives (App.jsx unmounts this
// as soon as the request resolves, regardless of which stage is showing).
export default function ScanProgress({ filename }) {
  const [stageIndex, setStageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setStageIndex((i) => Math.min(i + 1, STAGES.length - 1))
    }, 1400)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="scan-progress" role="status" aria-live="polite">
      <div className="scan-progress-sweep" />
      <p className="scan-progress-file">{filename}</p>
      <p className="scan-progress-stage">{STAGES[stageIndex]}…</p>
      <div className="scan-progress-track">
        <div
          className="scan-progress-fill"
          style={{ width: `${((stageIndex + 1) / STAGES.length) * 100}%` }}
        />
      </div>
    </div>
  )
}
