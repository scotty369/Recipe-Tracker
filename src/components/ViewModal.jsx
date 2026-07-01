import { getCatIcon, getCatLabel } from '../constants'
import ModalShell from './ModalShell'

export default function ViewModal({ recipe: r, onClose, onEdit, onDelete }) {
  if (!r) return null

  function handleDelete() {
    if (window.confirm('Delete this recipe? This cannot be undone.')) onDelete()
  }

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
            {r.servings && <Chip text={`👥 ${r.servings} servings`} />}
            {r.difficulty && <Chip text={`⚡ ${r.difficulty}`} />}
          </div>
        </div>
        <button onClick={onClose} style={ghostBtn}>✕</button>
      </div>

      {/* Ingredients */}
      {r.ingredients?.length > 0 && (
        <Section title="Ingredients">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}>
            {r.ingredients.map((ing, i) => (
              <div key={i} style={{
                display: 'flex', gap: 8, padding: '5px 0',
                borderBottom: '1px solid #F5F0EB', fontSize: 14,
              }}>
                <span style={{ color: '#EA580C', fontWeight: 600, minWidth: 80, flexShrink: 0 }}>{ing.qty}</span>
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
