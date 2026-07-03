import { useState } from 'react'
import ModalShell from './ModalShell'

export default function ImportModal({ onClose, onImported }) {
  const [url, setUrl] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | error
  const [errorMsg, setErrorMsg] = useState('')

  async function handleImport() {
    const trimmed = url.trim()
    if (!trimmed.startsWith('http')) {
      setErrorMsg('Please paste a full URL starting with http:// or https://')
      setStatus('error')
      return
    }

    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/.netlify/functions/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmed }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErrorMsg(data.error || 'Something went wrong. Try a different URL.')
        setStatus('error')
        return
      }

      // Pass extracted data up to App, which opens the form pre-filled
      onImported(data)
    } catch {
      setErrorMsg('Network error — make sure you are connected and try again.')
      setStatus('error')
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter') handleImport()
  }

  return (
    <ModalShell onClose={onClose}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Import from URL</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#78716C' }}>
            Paste a link from Allrecipes, Food Network, NYT Cooking, and more
          </p>
        </div>
        <button onClick={onClose} style={ghostBtn}>✕</button>
      </div>

      {/* URL input */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          value={url}
          onChange={e => { setUrl(e.target.value); setStatus('idle') }}
          onKeyDown={handleKey}
          placeholder="https://www.allrecipes.com/recipe/..."
          autoFocus
          style={{
            flex: 1, padding: '9px 12px', borderRadius: 8,
            border: `1.5px solid ${status === 'error' ? '#FCA5A5' : '#E5E0D8'}`,
            fontSize: 14, color: '#1C1917', background: '#FAFAFA',
            fontFamily: 'inherit',
          }}
        />
        <button
          onClick={handleImport}
          disabled={status === 'loading'}
          style={{ ...primaryBtn, opacity: status === 'loading' ? 0.7 : 1, whiteSpace: 'nowrap' }}
        >
          {status === 'loading' ? 'Fetching…' : 'Import'}
        </button>
      </div>

      {/* Error */}
      {status === 'error' && (
        <div style={{
          padding: '10px 12px', background: '#FEF2F2', border: '1px solid #FCA5A5',
          borderRadius: 8, color: '#DC2626', fontSize: 13,
        }}>
          {errorMsg}
        </div>
      )}

      {/* Loading state */}
      {status === 'loading' && (
        <div style={{ textAlign: 'center', padding: '20px 0', color: '#A8A29E', fontSize: 13 }}>
          Fetching recipe… this takes a few seconds
        </div>
      )}

      {/* Supported sites note */}
      {status === 'idle' && (
        <p style={{ fontSize: 12, color: '#A8A29E', margin: '10px 0 0', lineHeight: 1.6 }}>
          Works with most major recipe sites that use standard markup — Allrecipes, Food Network,
          Serious Eats, Tasty, BBC Good Food, NYT Cooking, Simply Recipes, and hundreds more.
          After importing, you'll review and confirm the recipe before it's saved.
        </p>
      )}
    </ModalShell>
  )
}

const primaryBtn = {
  padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
  background: '#EA580C', color: '#FFFFFF', fontSize: 13, fontWeight: 600,
  fontFamily: 'inherit',
}
const ghostBtn = {
  padding: '7px 12px', borderRadius: 8, border: '1px solid #E5E0D8',
  background: 'transparent', cursor: 'pointer', fontSize: 13, color: '#44403C',
  fontFamily: 'inherit',
}
