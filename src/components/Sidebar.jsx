import { useState } from 'react'
import { CATEGORIES, getCatIcon, getCatLabel } from '../constants'

export default function Sidebar({ recipes, filter, setFilter, search, setSearch }) {
  const [openCats, setOpenCats] = useState({})

  function countFor(catId, sub) {
    if (sub) return recipes.filter(r => r.category === catId && r.sub === sub).length
    if (catId) return recipes.filter(r => r.category === catId).length
    return recipes.length
  }

  function toggleCat(id) {
    setOpenCats(p => ({ ...p, [id]: !p[id] }))
  }

  return (
    <aside style={{
      width: 240, minWidth: 240,
      background: '#FFFFFF',
      borderRight: '1px solid #E5E0D8',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ padding: '18px 16px 10px', borderBottom: '1px solid #E5E0D8', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 22 }}>📖</span>
          <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.3px' }}>Recipe Book</span>
        </div>
      </div>

      {/* Search */}
      <div style={{ padding: '10px 10px 6px', flexShrink: 0 }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search recipes…"
          style={{
            width: '100%', padding: '7px 10px', borderRadius: 8,
            border: '1px solid #E5E0D8', fontSize: 13,
            background: '#F9F6F0', color: '#1C1917',
          }}
        />
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '4px 0 12px' }}>
        <NavItem
          icon="📋" label="All Recipes" count={countFor()}
          active={filter.type === 'all'}
          onClick={() => setFilter({ type: 'all' })}
        />
        {CATEGORIES.map(cat => (
          <CatGroup
            key={cat.id} cat={cat}
            isOpen={!!openCats[cat.id]}
            onToggle={() => toggleCat(cat.id)}
            filter={filter} setFilter={setFilter}
            countFor={countFor}
          />
        ))}
      </nav>
    </aside>
  )
}

function NavItem({ icon, label, count, active, onClick, indent = 0 }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 7,
      width: '100%', border: 'none', cursor: 'pointer',
      padding: `6px ${12 + indent * 14}px`,
      fontSize: 13, textAlign: 'left',
      background: active ? '#FFF3E6' : 'transparent',
      color: active ? '#C2410C' : '#44403C',
      fontWeight: active ? 600 : 400,
    }}>
      <span style={{ fontSize: indent ? 12 : 15 }}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      <span style={{
        fontSize: 11, borderRadius: 10, padding: '1px 7px',
        background: active ? '#FFEDD5' : '#F5F0EB',
        color: active ? '#EA580C' : '#A8A29E',
      }}>{count}</span>
    </button>
  )
}

function CatGroup({ cat, isOpen, onToggle, filter, setFilter, countFor }) {
  return (
    <div>
      <button onClick={onToggle} style={{
        display: 'flex', alignItems: 'center', gap: 7,
        width: '100%', border: 'none', cursor: 'pointer',
        padding: '6px 12px', fontSize: 13, textAlign: 'left',
        background: 'transparent', fontWeight: 500, color: '#1C1917',
      }}>
        <span style={{
          fontSize: 10, color: '#A8A29E',
          transform: isOpen ? 'rotate(90deg)' : 'none',
          display: 'inline-block', transition: 'transform 0.15s',
        }}>▶</span>
        <span style={{ fontSize: 16 }}>{cat.icon}</span>
        <span style={{ flex: 1 }}>{cat.label}</span>
        <span style={{ fontSize: 11, color: '#A8A29E', background: '#F5F0EB', borderRadius: 10, padding: '1px 7px' }}>
          {countFor(cat.id)}
        </span>
      </button>

      {isOpen && (
        <div>
          <NavItem
            icon="•" label={`All ${cat.label}`}
            count={countFor(cat.id)} indent={1}
            active={filter.type === 'cat' && filter.catId === cat.id}
            onClick={() => setFilter({ type: 'cat', catId: cat.id })}
          />
          {cat.subs.map(sub => (
            <NavItem
              key={sub} icon="·" label={sub}
              count={countFor(cat.id, sub)} indent={1.5}
              active={filter.type === 'sub' && filter.catId === cat.id && filter.sub === sub}
              onClick={() => setFilter({ type: 'sub', catId: cat.id, sub })}
            />
          ))}
        </div>
      )}
    </div>
  )
}
