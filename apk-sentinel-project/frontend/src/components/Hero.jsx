import './Hero.css'

// Real categories the engine actually detects — not decorative placeholder
// text — cycling around the radar to hint at what a scan surfaces.
const SCAN_CHIPS = ['READ_SMS', 'DexClassLoader', 'api.firebaseio.com', 'unity3d ads sdk', 'SecretKeySpec']

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-copy">
        <p className="hero-eyebrow">Static analysis engine</p>
        <h2 className="hero-headline">
          Know what's inside
          <br />
          before you tap install.
        </h2>
        <p className="hero-sub">
          Modded game APKs are rarely just the game. APK Sentinel unpacks the archive and
          surfaces the permissions, embedded URLs, and bytecode signatures hiding underneath —
          before the file gets access to your phone.
        </p>
      </div>

      <div className="hero-radar" aria-hidden="true">
        <div className="radar-ring radar-ring--outer" />
        <div className="radar-ring radar-ring--mid" />
        <div className="radar-sweep" />
        <svg className="radar-shield" width="30" height="30" viewBox="0 0 32 32" fill="none">
          <path
            d="M16 5 L26 9 V16 C26 22 21.5 26 16 27.5 C10.5 26 6 22 6 16 V9 Z"
            stroke="#2BD9C9"
            strokeWidth="1.6"
          />
          <circle cx="16" cy="15.5" r="4.4" stroke="#2BD9C9" strokeWidth="1.5" />
        </svg>
        {SCAN_CHIPS.map((chip, i) => (
          <span
            key={chip}
            className="radar-chip"
            style={{
              animationDelay: `${i * 1.15}s`,
              '--angle': `${(360 / SCAN_CHIPS.length) * i}deg`,
            }}
          >
            {chip}
          </span>
        ))}
      </div>
    </section>
  )
}
