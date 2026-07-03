import { useState } from 'react'
import { getCatIcon, getCatLabel } from '../constants'
import ModalShell from './ModalShell'

// ── Quantity scaling logic ─────────────────────────────────────────────────────
// Fraction map for display (e.g. 0.25 → "¼")
const VULGAR = [
  [1, ''],
  [3/4, '¾'], [2/3, '⅔'], [1/2, '½'], [1/3, '⅓'], [1/4, '¼'],
  [1/8, '⅛'],
]

function toFraction(n) {
  const whole = Math.floor(n)
  const decimal = n - whole
  if (decimal < 0.05) return whole === 0 ? '' : String(whole)
  for (const [val, sym] of VULGAR) {
    if (Math.abs(decimal - val) < 0.08) {
      return whole === 0 ? sym : `${whole} ${sym}`
    }
  }
  // Fall back to 1 decimal place
  return n % 1 === 0 ? String(n) : n.toFixed(1)
}

// Tries to parse a quantity string like "2", "1½", "1/2", "2-3", "2 cups" → number
// Returns null if it can't find a number to scale
function parseQty(str) {
  if (!str || typeof str !== 'string') return null
  const s = str.trim()

  // Replace unicode fractions
  const normalized = s
    .replace(/¼/g, '0.25').replace(/½/g, '0.5').replace(/¾/g, '0.75')
    .replace(/⅓/g, '0.333').replace(/⅔/g, '0.667')
    .replace(/⅛/g, '0.125').replace(/⅜/g, '0.375')
    .replace(/⅝/g, '0.625').replace(/⅞/g, '0.875')

  // Match leading number: "2 1/2", "1/2", "2.5", "2"
  const m = normalized.match(/^(\d+)\s+(\d+)\/(\d+)/) // mixed: "2 1/2"
    || normalized.match(/^(\d+)\/(\d+)/)               // fraction: "1/2"
    || normalized.match(/^(\d*\.?\d+)/)                // decimal/int: "2.5"

  if (!m) return null
  if (m[0].includes('/') && m.length === 3) return parseInt(m[1]) / parseInt(m[2])
  if (m.length === 4) return parseInt(m[1]) + parseInt(m[2]) / parseInt(m[3])
  return parseFloat(m[1])
}

function scaleQty(qtyStr, factor) {
  if (!qtyStr || factor === 1) return qtyStr
  const num = parseQty(qtyStr)
  if (num === null) return qtyStr // can't parse, return as-is

  const scaled = num * factor

  // Preserve the unit suffix (everything after the leading number)
  const suffix = qtyStr.trim().replace(/^[\d\s½¼¾⅓⅔⅛⅜⅝⅞\/\.\-]+/, '').trim()
  const scaledStr = toFraction(scaled)

  return suffix ? `${scaledStr} ${suffix}` : scaledStr
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function ViewModal({ recipe: r, onClose, onEdit, onDelete }) {
  const [scale, setScale] = useState(1)

  if (!r) return null

  const baseServings = parseFloat(r.servings) || null
  const scaledServings = baseServings ? Math.round(baseServings * scale * 10) / 10 : null

  function handleDelete() {
    if (window.confirm('Delete this recipe? This cannot be undone.')) onDelete()
  }

  const SCALE_OPTIONS = [0.5, 1, 1.5, 2, 3, 4]

  return (
    <ModalShell onClose={onClose} wide>
      {/* Title row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
        <span style={{ fontSize: 40 }}>{r.emoji || '📄'}</span>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{r.title}</h2>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
            <Chip text={`${getCatIcon(r.category)} ${r.sub || getCatLabel(r.category)}`} accent />
            {r.time && <Chip text={`⏱ ${r.time}`} />}
            {r.difficulty && <Chip text={`⚡ ${r.difficulty}`} />}
            {scaledServings && (
              <Chip text={`👥 ${scaledServings} serving${scaledServings !== 1 ? 's' : ''}`} />
            )}
          </div>
        </div>
        <button onClick={onClose} style={ghostBtn}>✕</button>
      </div>

      {/* Scaling controls — only show if recipe has ingredients */}
      {r.ingredients?.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: '#FFF9F5', border: '1px solid #FDE8D8',
          borderRadius: 10, padding: '10px 14px', marginBottom: 18,
        }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#C2410C', whiteSpace: 'nowrap' }}>
            ⚖️ Scale recipe
          </span>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {SCALE_OPTIONS.map(s => (
              <button
                key={s}
                onClick={() => setScale(s)}
                style={{
                  padding: '4px 11px', borderRadius: 7, fontSize: 13,
                  cursor: 'pointer', border: '1px solid',
                  fontFamily: 'inherit', fontWeight: scale === s ? 700 : 400,
                  background: scale === s ? '#EA580C' : 'transparent',
                  borderColor: scale === s ? '#EA580C' : '#E5E0D8',
                  color: scale === s ? '#FFFFFF' : '#44403C',
                  transition: 'all 0.1s',
                }}
              >
                {s === 1 ? '1× (original)' : `${s}×`}
              </button>
            ))}
          </div>
          {scale !== 1 && (
            <span style={{ fontSize: 12, color: '#EA580C', marginLeft: 'auto', whiteSpace: 'nowrap' }}>
              {scale < 1 ? '▼' : '▲'} scaled {scale < 1 ? 'down' : 'up'}
            </span>
          )}
        </div>
      )}

      {/* Ingredients */}
      {r.ingredients?.length > 0 && (
        <Section title={`Ingredients${scale !== 1 ? ` (${scale}×)` : ''}`}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}>
            {r.ingredients.map((ing, i) => (
              <div key={i} style={{
                display: 'flex', gap: 8, padding: '5px 0',
                borderBottom: '1px solid #F5F0EB', fontSize: 14,
              }}>
                <span style={{
                  color: '#EA580C', fontWeight: 600, minWidth: 80, flexShrink: 0,
                  transition: 'opacity 0.15s',
                }}>
                  {scaleQty(ing.qty, scale)}
                </span>
                <span style={{ color: '#44403C' }}>{ing.name}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Instructions */}
      {r.instructions && (
        <Section title="Instructions">
          <pre style={{
            fontFamily: 'inherit', fontSize: 14, lineHeight: 1.75,
            whiteSpace: 'pre-wrap', color: '#44403C', margin: 0,
          }}>
            {r.instructions}
          </pre>
        </Section>
      )}

      {/* Notes */}
      {r.notes && (
        <Section title="Notes & Tips">
          <p style={{
            fontSize: 14, color: '#78716C', margin: 0, lineHeight: 1.6,
            background: '#FFF9F5', padding: 12, borderRadius: 8,
            borderLeft: '3px solid #FB923C',
          }}>
            {r.notes}
          </p>
        </Section>
      )}

      {/* Tags */}
      {r.tags?.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
          {r.tags.map(t => (
            <span key={t} style={{
              fontSize: 12, padding: '3px 10px', borderRadius: 10,
              background: '#F5F0EB', color: '#78716C',
            }}>{t}</span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div style={{
        display: 'flex', gap: 8, justifyContent: 'flex-end',
        marginTop: 20, paddingTop: 14, borderTop: '1px solid #E5E0D8',
      }}>
        <button onClick={handleDelete} style={{ ...ghostBtn, color: '#DC2626', borderColor: '#FCA5A5' }}>
          🗑 Delete
        </button>
        <button onClick={onClose} style={ghostBtn}>Close</button>
        <button onClick={onEdit} style={primaryBtn}>✏️ Edit</button>
      </div>
    </ModalShell>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <p style={{
        fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
        textTransform: 'uppercase', color: '#A8A29E', margin: '0 0 8px',
      }}>{title}</p>
      {children}
    </div>
  )
}

function Chip({ text, accent }) {
  return (
    <span style={{
      fontSize: 12, padding: '3px 10px', borderRadius: 10,
      background: accent ? '#FFF3E6' : '#F5F0EB',
      color: accent ? '#C2410C' : '#78716C',
      fontWeight: accent ? 600 : 400,
    }}>{text}</span>
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