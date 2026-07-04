import './RiskGauge.css'

const LEVEL_COLOR = {
  Safe: 'var(--safe)',
  Suspicious: 'var(--suspicious)',
  'High Risk': 'var(--high-risk)',
  Malicious: 'var(--malicious)',
}

export default function RiskGauge({ score, level }) {
  const clamped = Math.max(0, Math.min(100, score))
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - clamped / 100)
  const color = LEVEL_COLOR[level] || 'var(--text-secondary)'

  return (
    <div className="risk-gauge">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="var(--border)" strokeWidth="10" />
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 70 70)"
          className="risk-gauge-arc"
        />
      </svg>
      <div className="risk-gauge-center">
        <span className="risk-gauge-score">{clamped}</span>
        <span className="risk-gauge-max">/100</span>
      </div>
    </div>
  )
}
