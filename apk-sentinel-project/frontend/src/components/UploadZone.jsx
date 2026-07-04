import { useCallback, useRef, useState } from 'react'
import './UploadZone.css'

function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`
}

export default function UploadZone({ onFileSelected, selectedFile, onScan, disabled }) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef(null)

  const handleFiles = useCallback(
    (files) => {
      const file = files?.[0]
      if (!file) return
      if (!file.name.toLowerCase().endsWith('.apk')) {
        onFileSelected(null, 'Only .apk files are accepted.')
        return
      }
      onFileSelected(file, null)
    },
    [onFileSelected],
  )

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (disabled) return
    handleFiles(e.dataTransfer.files)
  }

  return (
    <div className="upload-block">
      <div
        className={`dropzone ${isDragging ? 'dropzone--active' : ''} ${disabled ? 'dropzone--disabled' : ''}`}
        onDragOver={(e) => {
          e.preventDefault()
          if (!disabled) setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled) inputRef.current?.click()
        }}
        aria-label="Upload an APK file"
      >
        <input
          ref={inputRef}
          type="file"
          accept=".apk"
          hidden
          disabled={disabled}
          onChange={(e) => handleFiles(e.target.files)}
        />

        <svg className="dropzone-icon" width="40" height="40" viewBox="0 0 40 40" fill="none">
          <path
            d="M20 6 L34 12 V20 C34 28 27.5 33.5 20 35.5 C12.5 33.5 6 28 6 20 V12 Z"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path d="M20 15 V25 M15 20 L20 15 L25 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        {selectedFile ? (
          <div className="dropzone-file">
            <span className="dropzone-filename">{selectedFile.name}</span>
            <span className="dropzone-filesize">{formatBytes(selectedFile.size)}</span>
          </div>
        ) : (
          <>
            <p className="dropzone-title">Drop an APK here, or click to browse</p>
            <p className="dropzone-subtitle">Only .apk package files are accepted</p>
          </>
        )}
      </div>

      <button
        className="scan-button"
        onClick={onScan}
        disabled={!selectedFile || disabled}
      >
        {disabled ? 'Scanning…' : 'Run Scan'}
      </button>
    </div>
  )
}
