import './HowItWorks.css'

const STEPS = [
  {
    n: '01',
    title: 'Upload the APK',
    text: 'Drop the file in — it goes straight to the scan engine, nothing is installed or run.',
  },
  {
    n: '02',
    title: 'Static analysis runs',
    text: 'The manifest, dex bytecode, and archive contents are parsed for permissions, URLs, and API signatures.',
  },
  {
    n: '03',
    title: 'Get a plain verdict',
    text: 'A risk score, the specific flags behind it, and a plain-language summary — no jargon required.',
  },
]

export default function HowItWorks() {
  return (
    <div className="how-it-works">
      {STEPS.map((s) => (
        <div className="step" key={s.n}>
          <span className="step-number">{s.n}</span>
          <div>
            <h4 className="step-title">{s.title}</h4>
            <p className="step-text">{s.text}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
