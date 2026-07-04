import { useState } from 'react'
import Hero from './components/Hero'
import FeatureGrid from './components/FeatureGrid'
import HowItWorks from './components/HowItWorks'
import UploadZone from './components/UploadZone'
import ScanProgress from './components/ScanProgress'
import ResultsDashboard from './components/ResultsDashboard'
import ErrorBanner from './components/ErrorBanner'
import { uploadApk, ApiError } from './lib/api'
import './App.css'

export default function App() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [status, setStatus] = useState('idle') // idle | scanning | done
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleFileSelected = (file, err) => {
    setError(err)
    setResult(null)
    setSelectedFile(file)
  }

  const handleScan = async () => {
    if (!selectedFile) return
    setStatus('scanning')
    setError(null)
    try {
      const data = await uploadApk(selectedFile)
      setResult(data)
      setStatus('done')
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Something went wrong during the scan.'
      setError(message)
      setStatus('idle')
    }
  }

  const handleReset = () => {
    setSelectedFile(null)
    setResult(null)
    setError(null)
    setStatus('idle')
  }

  // Marketing content only makes sense before someone commits to a file —
  // once they've picked one, or a scan is running/done, it's just noise.
  const showLanding = status === 'idle' && !selectedFile

  return (
    <div className="app">
      <div className="ambient-glow" aria-hidden="true">
        <span className="glow-blob glow-blob--a" />
        <span className="glow-blob glow-blob--b" />
      </div>

      <header className="app-header">
        <div className="app-brand">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <path
              d="M16 5 L26 9 V16 C26 22 21.5 26 16 27.5 C10.5 26 6 22 6 16 V9 Z"
              stroke="#2BD9C9"
              strokeWidth="1.6"
            />
            <circle cx="16" cy="15.5" r="4.4" stroke="#2BD9C9" strokeWidth="1.5" />
            <line x1="16" y1="15.5" x2="16" y2="9.5" stroke="#2BD9C9" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <div>
            <h1 className="app-title">APK Sentinel</h1>
            <p className="app-tagline">Automated Mod APK Threat Detection</p>
          </div>
        </div>
      </header>

      <main className="app-main">
        {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

        {showLanding && <Hero />}
        {showLanding && <FeatureGrid />}

        {status !== 'done' && (
          <UploadZone
            selectedFile={selectedFile}
            onFileSelected={handleFileSelected}
            onScan={handleScan}
            disabled={status === 'scanning'}
          />
        )}

        {showLanding && <HowItWorks />}

        {status === 'scanning' && <ScanProgress filename={selectedFile?.name} />}

        {status === 'done' && result && (
          <ResultsDashboard result={result} onReset={handleReset} />
        )}
      </main>

      <footer className="app-footer">
        <p>Static analysis only — treat results as a heuristic signal, not a guarantee.</p>
      </footer>
    </div>
  )
}
