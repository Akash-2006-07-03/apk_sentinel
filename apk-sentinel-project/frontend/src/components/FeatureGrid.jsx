import './FeatureGrid.css'

const ICONS = {
  shield: <path d="M9 2 L15 4 V9 C15 13 12.5 15.5 9 16.5 C5.5 15.5 3 13 3 9 V4 Z" />,
  link: (
    <>
      <path d="M7 11 L11 7" />
      <path d="M8.5 4.5 L10 3 A3 3 0 0 1 14.5 7.5 L13 9" />
      <path d="M9.5 13.5 L8 15 A3 3 0 0 1 3.5 10.5 L5 9" />
    </>
  ),
  bug: (
    <>
      <rect x="6" y="6" width="6" height="8" rx="3" />
      <path d="M9 6 V3 M6 8 L2 6 M12 8 L16 6 M6 12 L2 14 M12 12 L16 14 M9 14 V17" />
    </>
  ),
  layers: (
    <>
      <path d="M9 2 L16 6 L9 10 L2 6 Z" />
      <path d="M2 10 L9 14 L16 10" />
    </>
  ),
}

const FEATURES = [
  {
    icon: 'shield',
    title: 'Permission audit',
    text: 'Flags dangerous requests — SMS, camera, contacts, precise location.',
  },
  {
    icon: 'link',
    title: 'URL extraction',
    text: 'Pulls every embedded and bytecode-level endpoint out of the archive.',
  },
  {
    icon: 'bug',
    title: 'Bytecode signatures',
    text: 'Catches reflection, dynamic class loading, and shell execution calls.',
  },
  {
    icon: 'layers',
    title: 'Ad SDK fingerprinting',
    text: 'Identifies ad and tracking SDKs injected into the mod.',
  },
]

export default function FeatureGrid() {
  return (
    <div className="feature-grid">
      {FEATURES.map((f, i) => (
        <div className="feature-card" key={f.title} style={{ animationDelay: `${i * 0.08}s` }}>
          <svg
            className="feature-icon"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {ICONS[f.icon]}
          </svg>
          <h4 className="feature-title">{f.title}</h4>
          <p className="feature-text">{f.text}</p>
        </div>
      ))}
    </div>
  )
}
