import './ErrorBanner.css'

export default function ErrorBanner({ message, onDismiss }) {
  return (
    <div className="error-banner" role="alert">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.5" />
        <path d="M9 5.5V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="9" cy="12.5" r="0.9" fill="currentColor" />
      </svg>
      <p className="error-banner-text">{message}</p>
      <button className="error-banner-close" onClick={onDismiss} aria-label="Dismiss error">
        ×
      </button>
    </div>
  )
}
