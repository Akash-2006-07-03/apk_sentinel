import { useState } from 'react'
import RiskGauge from './RiskGauge'
import RiskBadge from './RiskBadge'
import './ResultsDashboard.css'

const ICONS = {
  shield: <path d="M9 2 L15 4 V9 C15 13 12.5 15.5 9 16.5 C5.5 15.5 3 13 3 9 V4 Z" />,
  key: (
    <>
      <circle cx="6" cy="12" r="3" />
      <path d="M8.2 9.8 L16 2 M13 5 L15.5 7.5 M11 7 L13 9" />
    </>
  ),
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
  alert: (
    <>
      <path d="M9 2 L16 15 H2 Z" />
      <path d="M9 7 V10.5" />
      <circle cx="9" cy="12.5" r="0.6" fill="currentColor" stroke="none" />
    </>
  ),
  sparkle: <path d="M9 2 L10.3 7.2 L15.5 8.5 L10.3 9.8 L9 15 L7.7 9.8 L2.5 8.5 L7.7 7.2 Z" />,
}

function Icon({ name }) {
  return (
    <svg
      className="card-icon"
      width="15"
      height="15"
      viewBox="0 0 18 18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {ICONS[name]}
    </svg>
  )
}

function Card({ title, icon, children, className = '', tone }) {
  return (
    <section className={`card ${className} ${tone ? `card--${tone}` : ''}`}>
      <h3 className="card-title">
        {icon && <Icon name={icon} />}
        {title}
      </h3>
      {children}
    </section>
  )
}

function EmptyRow({ text }) {
  return <p className="empty-row">✓ {text}</p>
}

function PermissionPill({ children, dangerous }) {
  return <span className={`perm-pill ${dangerous ? 'perm-pill--dangerous' : ''}`}>{children}</span>
}

function shortPermName(perm) {
  const parts = perm.split('.')
  return parts[parts.length - 1]
}

// Backend returns plain strings like "AI explanation error: ..." or
// "AI explanation unavailable: ..." instead of throwing, so detect that
// prefix here and render it as a system notice rather than a real summary.
function isAiError(text) {
  return typeof text === 'string' && /^AI explanation (error|unavailable)/i.test(text.trim())
}

// The backend prompts the model to return 4 lines starting with "• ".
// Parse that into a real list; if the model ever ignores the format and
// sends a plain paragraph back, fall back to rendering it as-is.
function parseAiPoints(text) {
  if (typeof text !== 'string') return null
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^[•\-*]\s*/, '').replace(/^\d+[.)]\s*/, ''))
  return lines.length > 1 ? lines : null
}

const PERM_PREVIEW_COUNT = 12

function CollapsiblePillList({ items, dangerous }) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? items : items.slice(0, PERM_PREVIEW_COUNT)
  const hiddenCount = items.length - PERM_PREVIEW_COUNT

  return (
    <>
      <div className="pill-list">
        {visible.map((p) => (
          <PermissionPill key={p} dangerous={dangerous}>
            {shortPermName(p)}
          </PermissionPill>
        ))}
      </div>
      {hiddenCount > 0 && (
        <button className="show-more" onClick={() => setExpanded((e) => !e)}>
          {expanded ? 'Show less' : `+ ${hiddenCount} more`}
        </button>
      )}
    </>
  )
}

function SummaryStat({ value, label, tone }) {
  return (
    <div className={`summary-stat ${tone ? `summary-stat--${tone}` : ''}`}>
      <span className="summary-stat-value">{value}</span>
      <span className="summary-stat-label">{label}</span>
    </div>
  )
}

export default function ResultsDashboard({ result, onReset }) {
  const { analysis, risk, ai_explanation, filename } = result
  const dangerousSet = new Set(analysis.dangerous_permissions || [])
  const otherPermissions = (analysis.all_permissions || []).filter((p) => !dangerousSet.has(p))
  const dangerousCount = analysis.dangerous_permissions?.length || 0
  const urlCount = (analysis.urls_found?.length || 0) + (analysis.urls_unverified?.length || 0)
  const apiCount = analysis.suspicious_apis?.length || 0
  const aiFailed = isAiError(ai_explanation)
  const aiPoints = !aiFailed ? parseAiPoints(ai_explanation) : null

  return (
    <div className="results">
      <div className="results-header">
        <div className="results-header-info">
          <p className="results-eyebrow">Scan complete · {filename}</p>
          <h2 className="results-app-name">
            {analysis.app_name || analysis.package_name || 'Unknown app'}
          </h2>
          <p className="results-package">{analysis.package_name}</p>
          <div className="results-meta">
            <span>Version {analysis.version || 'n/a'}</span>
            <span className="dot">·</span>
            <span>Min SDK {analysis.min_sdk ?? 'n/a'}</span>
            <span className="dot">·</span>
            <span>Target SDK {analysis.target_sdk ?? 'n/a'}</span>
          </div>
        </div>

        <div className="results-header-risk">
          <RiskGauge score={risk.score} level={risk.level} />
          <RiskBadge level={risk.level} />
        </div>
      </div>

      <div className="summary-strip">
        <SummaryStat value={dangerousCount} label="Dangerous perms" tone={dangerousCount ? 'malicious' : 'safe'} />
        <SummaryStat value={urlCount} label="URLs found" tone={urlCount ? 'suspicious' : 'safe'} />
        <SummaryStat value={apiCount} label="Suspicious APIs" tone={apiCount ? 'high-risk' : 'safe'} />
        <SummaryStat
          value={risk.reasons?.length || 0}
          label="Risk factors"
          tone={risk.reasons?.length ? 'malicious' : 'safe'}
        />
      </div>

      <Card title="AI Threat Summary" icon="sparkle" className="card--wide" tone={aiFailed ? 'muted' : null}>
        {aiFailed ? (
          <p className="ai-explanation ai-explanation--error">
            The AI summary couldn't be generated for this scan. The scored risk data below is still
            complete and accurate — this only affects the plain-language write-up.
          </p>
        ) : aiPoints ? (
          <ul className="ai-points">
            {aiPoints.map((point, i) => (
              <li key={i} className="ai-point">
                {point}
              </li>
            ))}
          </ul>
        ) : (
          <p className="ai-explanation">{ai_explanation}</p>
        )}
      </Card>

      {risk.reasons?.length > 0 && (
        <Card title="Risk Factors" icon="alert" className="card--wide" tone="alert">
          <ul className="reason-list">
            {risk.reasons.map((r, i) => (
              <li key={i} className="reason-item">
                {r}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="results-grid">
        <Card title={`Dangerous Permissions (${dangerousCount})`} icon="shield">
          {dangerousCount ? (
            <div className="pill-list">
              {analysis.dangerous_permissions.map((p) => (
                <PermissionPill key={p} dangerous>
                  {shortPermName(p)}
                </PermissionPill>
              ))}
            </div>
          ) : (
            <EmptyRow text="No dangerous permissions requested." />
          )}
        </Card>

        <Card title={`Suspicious APIs (${apiCount})`} icon="bug">
          {apiCount ? (
            <ul className="api-list">
              {analysis.suspicious_apis.map((a) => (
                <li key={a} className="api-item">
                  {a}
                </li>
              ))}
            </ul>
          ) : (
            <EmptyRow text="No suspicious API signatures detected." />
          )}
        </Card>

        <Card title={`Other Permissions (${otherPermissions.length})`} icon="key">
          {otherPermissions.length ? (
            <CollapsiblePillList items={otherPermissions} />
          ) : (
            <EmptyRow text="No additional permissions." />
          )}
        </Card>

        <Card title="App Components" icon="layers">
          <div className="stat-row">
            <div className="stat">
              <span className="stat-value">{analysis.activities?.length || 0}</span>
              <span className="stat-label">Activities</span>
            </div>
            <div className="stat">
              <span className="stat-value">{analysis.services?.length || 0}</span>
              <span className="stat-label">Services</span>
            </div>
            <div className="stat">
              <span className="stat-value">{analysis.receivers?.length || 0}</span>
              <span className="stat-label">Receivers</span>
            </div>
          </div>
        </Card>

        <Card title={`Confirmed URLs (${analysis.urls_found?.length || 0})`} icon="link">
          {analysis.urls_found?.length ? (
            <ul className="url-list">
              {analysis.urls_found.map((u) => (
                <li key={u} className="url-item">
                  {u}
                </li>
              ))}
            </ul>
          ) : (
            <EmptyRow text="No URLs found in app assets." />
          )}
        </Card>

        <Card title={`Unverified URLs in Bytecode (${analysis.urls_unverified?.length || 0})`} icon="link">
          {analysis.urls_unverified?.length ? (
            <>
              <p className="card-hint">Extracted from raw bytecode — may include false positives.</p>
              <ul className="url-list url-list--muted">
                {analysis.urls_unverified.map((u) => (
                  <li key={u} className="url-item">
                    {u}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <EmptyRow text="Nothing detected in raw bytecode." />
          )}
        </Card>
      </div>

      <button className="reset-button" onClick={onReset}>
        Scan another APK
      </button>
    </div>
  )
}
