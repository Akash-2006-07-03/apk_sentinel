import './RiskBadge.css'

const LEVEL_CLASS = {
  Safe: 'badge--safe',
  Suspicious: 'badge--suspicious',
  'High Risk': 'badge--high-risk',
  Malicious: 'badge--malicious',
}

export default function RiskBadge({ level }) {
  const cls = LEVEL_CLASS[level] || 'badge--suspicious'
  return <span className={`risk-badge ${cls}`}>{level}</span>
}
