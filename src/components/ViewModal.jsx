import { useState } from 'react'
import { getCatIcon, getCatLabel } from '../constants'
import ModalShell from './ModalShell'

// ── Quantity scaling logic ─────────────────────────────────────────────────────
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
  return n % 1 === 0 ? String(n) : n.toFixed(1)
}

function parseQty(str) {
  if (!str || typeof str !== 'string') return null
  const s = str.trim()
  const normalized = s
    .replace(/¼/g, '0.25').replace(/½/g, '0.5').replace(/¾/g, '0.75')
    .replace(/⅓/g, '0.333').replace(/⅔/g, '0.667')
    .replace(/⅛/g, '0.125').replace(/⅜/g, '0.375')
    .replace(/⅝/g, '0.625').replace(/⅞/g, '0.875')

  const m = normalized.match(/^(\d+)\s+(\d+)\/(\d+)/)
    || normalized.match(/^(\d+)\/(\d+)/)
    || normalized.match(/^(\d*\.?\d+)/)

  if (!m) return null
  if (m[0].includes('/') && m.length === 3) return parseInt(m[1]) / parseInt(m[2])
  if (m.length === 4) return parseInt(m[1]) + parseInt(m[2]) / parseInt(m[3])
  return parseFloat(m[1])
}

function scaleQty(qtyStr, factor) {
  if (!qtyStr || factor === 1) return qtyStr
  const num = parseQty(qtyStr)
  if (num === null) return qtyStr
  const scaled = num * factor
  const suffix = qtyStr.trim().replace(/^[\d\s½¼¾⅓⅔⅛⅜⅝⅞\/\.\-]+/, '').trim()
  const scaledStr = toFraction(scaled)
  return suffix ? `${scaledStr} ${suffix}` : scaledStr
}

// ── Print handler ──────────────────────────────────────────────────────────────
function printRecipe(r, scale, scaledServings) {
  const ingredients = r.ingredients?.map(ing => `
    <tr>
      <td style="padding:5px 12px 5px 0; color:#C2410C; font-weight:600; white-space:nowrap; vertical-align:top;">${scaleQty(ing.qty, scale)}</td>
      <td style="padding:5px 0; color:#1C1917; vertical-align:top;">${ing.name}</td>
    </tr>`).join('') || ''

  const instructions = r.instructions
    ? r.instructions.split('\n').filter(l => l.trim()).map(line => `
    <p style="margin:0 0 10px; line-height:1.7; color:#1C1917;">${line}</p>`).join('')
    : ''

  const tags = r.tags?.length
    ? `<div style="margin-top:20px;">${r.tags.map(t => `<span style="display:inline-block;margin:3px 4px 3px 0;padding:3px 10px;border-radius:10px;background:#F5F0EB;color:#78716C;font-size:12px;">${t}</span>`).join('')}</div>`
    : ''

  const scaleNote = scale !== 1
    ? `<span style="margin-left:12px; font-size:13px; color:#EA580C; font-weight:600;">(scaled ${scale}×)</span>`
    : ''

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${r.title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: Georgia, 'Times New Roman', serif;
      color: #1C1917;
      background: #fff;
      padding: 40px 48px;
      max-width: 780px;
      margin: 0 auto;
    }
    @media print {
      body { padding: 0; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>

  <div class="no-print" style="margin-bottom:24px;">
    <button onclick="window.print()" style="padding:8px 18px;background:#EA580C;color:#fff;border:none;border-radius:8px;font-size:14px;cursor:pointer;font-family:inherit;margin-right:8px;">
      🖨️ Print
    </button>
    <button onclick="window.close()" style="padding:8px 18px;background:transparent;color:#44403C;border:1px solid #E5E0D8;border-radius:8px;font-size:14px;cursor:pointer;font-family:inherit;">
      Close
    </button>
  </div>

  <div style="border-bottom:2px solid #E5E0D8;padding-bottom:18px;margin-bottom:24px;">
    <div style="font-size:36px;margin-bottom:8px;">${r.emoji || '📄'}</div>
    <h1 style="font-size:28px;font-weight:700;color:#1C1917;margin-bottom:10px;line-height:1.2;">${r.title}</h1>
    <div style="display:flex;gap:20px;flex-wrap:wrap;font-size:14px;color:#78716C;">
      ${r.sub ? `<span>📂 ${r.sub}</span>` : ''}
      ${scaledServings ? `<span>👥 ${scaledServings} serving${scaledServings !== 1 ? 's' : ''}${scaleNote}</span>` : scaleNote ? `<span>${scaleNote}</span>` : ''}
      ${r.time ? `<span>⏱ ${r.time}</span>` : ''}
      ${r.difficulty ? `<span>⚡ ${r.difficulty}</span>` : ''}
    </div>
  </div>

  <div style="display:grid;grid-template-columns:1fr 1.6fr;gap:32px;margin-bottom:24px;">

    ${ingredients ? `
    <div>
      <h2 style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#A8A29E;margin-bottom:12px;">
        Ingredients${scale !== 1 ? ` (${scale}×)` : ''}
      </h2>
      <table style="width:100%;border-collapse:collapse;">
        <tbody>${ingredients}</tbody>
      </table>
    </div>` : '<div></div>'}

    ${instructions ? `
    <div>
      <h2 style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#A8A29E;margin-bottom:12px;">
        Instructions
      </h2>
      ${instructions}
    </div>` : ''}

  </div>

  ${r.notes ? `
  <div style="margin-bottom:20px;padding:14px 16px;background:#FFF9F5;border-left:3px solid #FB923C;border-radius:0 8px 8px 0;">
    <h2 style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#A8A29E;margin-bottom:8px;">Notes & Tips</h2>
    <p style="font-size:14px;color:#78716C;line-height:1.6;">${r.notes}</p>
  </div>` : ''}

  ${tags}

  <div style="margin-top:32px;padding-top:14px;border-top:1px solid #E5E0D8;font-size:12px;color:#A8A29E;">
    Printed from Recipe Book
  </div>

</body>
</html>`

  const win = window.open('', '_blank', 'width=860,height=900')
  win.document.write(html)
  win.document.close()
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

      {/* Scaling controls */}
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
        <button onClick={() => printRecipe(r, scale, scaledServings)} style={ghostBtn}>
          🖨️ Print
        </button>
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