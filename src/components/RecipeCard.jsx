import { useState } from 'react'
import { getCatIcon, getCatLabel } from '../constants'

export default function RecipeCard({ recipe: r, onClick }) {
  const [hov, setHov] = useState(false)

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: '#FFFFFF',
        border: `1.5px solid ${hov ? '#F97316' : '#E5E0D8'}`,
        borderRadius: 12, padding: '14px 14px 12px',
        cursor: 'pointer', textAlign: 'left',
        transition: 'border-color 0.15s, transform 0.1s, box-shadow 0.1s',
        transform: hov ? 'translateY(-2px)' : 'none',
        boxShadow: hov ? '0 4px 16px rgba(0,0,0,0.08)' : 'none',
        display: 'flex', flexDirection: 'column', gap: 0,
      }}
    >
      <div style={{ fontSize: 28, marginBottom: 8 }}>{r.emoji || '📄'}</div>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, lineHeight: 1.3, color: '#1C1917' }}>
        {r.title}
      </div>
      <div style={{ fontSize: 12, color: '#78716C', marginBottom: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {r.time && <span>⏱ {r.time}</span>}
        {r.servings && <span>👥 {r.servings}</span>}
        {r.difficulty && <span>⚡ {r.difficulty}</span>}
      </div>
      <div>
        <span style={{
          fontSize: 11, padding: '2px 8px', borderRadius: 10,
          background: '#FFF3E6', color: '#C2410C', fontWeight: 500,
        }}>
          {getCatIcon(r.category)} {r.sub || getCatLabel(r.category)}
        </span>
      </div>
    </button>
  )
}
