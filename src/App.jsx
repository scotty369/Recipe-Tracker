import { useState, useEffect } from 'react'
import { useRecipes } from './useRecipes'
import { getCatIcon, getCatLabel } from './constants'
import Sidebar from './components/Sidebar'
import RecipeCard from './components/RecipeCard'
import ViewModal from './components/ViewModal'
import FormModal from './components/FormModal'
import ImportModal from './components/ImportModal'

const SORT_OPTIONS = [
  { value: 'newest',     label: '🕒 Newest first' },
  { value: 'oldest',     label: '🕰 Oldest first' },
  { value: 'az',         label: '🔤 A → Z' },
  { value: 'za',         label: '🔤 Z → A' },
  { value: 'time_asc',   label: '⏱ Cook time (short first)' },
  { value: 'time_desc',  label: '⏱ Cook time (long first)' },
  { value: 'difficulty', label: '⚡ Difficulty (easy first)' },
]

const DIFFICULTY_RANK = { Easy: 1, Medium: 2, Advanced: 3 }
const MAX_RECENT = 5
const RECENT_KEY = 'recipetracker_recent'

function parseTime(str) {
  if (!str) return Infinity
  const h = str.match(/(\d+)\s*hr/i)?.[1] || 0
  const m = str.match(/(\d+)\s*min/i)?.[1] || 0
  const total = parseInt(h) * 60 + parseInt(m)
  return total > 0 ? total : Infinity
}

function loadRecentIds() {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY)) || [] } catch { return [] }
}

function saveRecentIds(ids) {
  try { localStorage.setItem(RECENT_KEY, JSON.stringify(ids)) } catch {}
}

export default function App() {
  const { recipes, loading, error, addRecipe, updateRecipe, deleteRecipe } = useRecipes()
  const [filter, setFilter] = useState({ type: 'all' })
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('newest')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [modal, setModal] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [showImport, setShowImport] = useState(false)
  const [importDefaults, setImportDefaults] = useState(null)
  const [recentIds, setRecentIds] = useState(loadRecentIds)

  // Keep recentIds in sync with localStorage
  useEffect(() => { saveRecentIds(recentIds) }, [recentIds])

  // Remove any IDs from recents that no longer exist (e.g. deleted recipes)
  useEffect(() => {
    if (!recipes.length) return
    const validIds = new Set(recipes.map(r => r.id))
    setRecentIds(prev => prev.filter(id => validIds.has(id)))
  }, [recipes])

  // ── Track recipe views ─────────────────────────────────────────────────────
  function openRecipe(id) {
    setRecentIds(prev => {
      const without = prev.filter(x => x !== id)
      return [id, ...without].slice(0, MAX_RECENT)
    })
    setModal({ mode: 'view', id })
  }

  // ── Filter + Sort ──────────────────────────────────────────────────────────
  function getFiltered() {
    const filtered = recipes.filter(r => {
      const matchCat =
        filter.type === 'all' ? true :
        filter.type === 'cat' ? r.category === filter.catId :
        r.category === filter.catId && r.sub === filter.sub

      const q = search.toLowerCase()
      const matchSearch = !q ||
        r.title.toLowerCase().includes(q) ||
        (r.notes || '').toLowerCase().includes(q) ||
        (r.tags || []).some(t => t.includes(q)) ||
        getCatLabel(r.category).toLowerCase().includes(q) ||
        (r.sub || '').toLowerCase().includes(q)

      return matchCat && matchSearch
    })

    return [...filtered].sort((a, b) => {
      switch (sort) {
        case 'newest':     return (b.created_at || 0) > (a.created_at || 0) ? 1 : -1
        case 'oldest':     return (a.created_at || 0) > (b.created_at || 0) ? 1 : -1
        case 'az':         return a.title.localeCompare(b.title)
        case 'za':         return b.title.localeCompare(a.title)
        case 'time_asc':   return parseTime(a.time) - parseTime(b.time)
        case 'time_desc':  return parseTime(b.time) - parseTime(a.time)
        case 'difficulty':
          return (DIFFICULTY_RANK[a.difficulty] || 99) - (DIFFICULTY_RANK[b.difficulty] || 99)
        default:           return 0
      }
    })
  }

  // ── Save handler ───────────────────────────────────────────────────────────
  async function handleSave(formData) {
    setSaving(true)
    setSaveError(null)
    try {
      if (modal?.id) {
        await updateRecipe(modal.id, formData)
      } else {
        await addRecipe(formData)
      }
      setModal(null)
      setImportDefaults(null)
    } catch (e) {
      setSaveError(e.message)
    } finally {
      setSaving(false)
    }
  }

  // ── Delete handler ─────────────────────────────────────────────────────────
  async function handleDelete(id) {
    try {
      await deleteRecipe(id)
      setRecentIds(prev => prev.filter(x => x !== id))
      setModal(null)
    } catch (e) {
      alert('Failed to delete: ' + e.message)
    }
  }

  // ── Import handler ─────────────────────────────────────────────────────────
  function handleImported(data) {
    setImportDefaults({
      title:        data.title        || '',
      emoji:        '📄',
      category:     'dinner',
      sub:          'Other Dinner',
      servings:     data.servings     || '',
      time:         data.time         || '',
      difficulty:   'Medium',
      ingredients:  data.ingredients?.length ? data.ingredients : [{ qty: '', name: '' }],
      instructions: data.instructions || '',
      notes:        data.notes        || '',
      tags:         [],
    })
    setShowImport(false)
    setModal({ mode: 'form' })
  }

  const filtered = getFiltered()
  const recentRecipes = recentIds
    .map(id => recipes.find(r => r.id === id))
    .filter(Boolean)

  const activeTitle =
    filter.type === 'all' ? 'All Recipes' :
    filter.type === 'cat' ? `${getCatIcon(filter.catId)} ${getCatLabel(filter.catId)}` :
    `${getCatIcon(filter.catId)} ${filter.sub}`

  const currentRecipe = modal?.id ? recipes.find(r => r.id === modal.id) : null

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#F9F6F0', overflow: 'hidden' }}>

      {/* Sidebar */}
      {sidebarOpen && (
        <Sidebar
          recipes={recipes}
          recentRecipes={recentRecipes}
          filter={filter} setFilter={setFilter}
          search={search} setSearch={setSearch}
          onOpenRecipe={openRecipe}
        />
      )}

      {/* Main */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Top bar */}
        <header style={{
          background: '#FFFFFF', borderBottom: '1px solid #E5E0D8',
          padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
        }}>
          <button onClick={() => setSidebarOpen(v => !v)} style={ghostBtn} title="Toggle sidebar">
            <span style={{ fontSize: 18 }}>☰</span>
          </button>
          <h1 style={{ flex: 1, fontSize: 16, fontWeight: 600, margin: 0 }}>{activeTitle}</h1>
          {!loading && (
            <span style={{ fontSize: 13, color: '#78716C' }}>
              {filtered.length} recipe{filtered.length !== 1 ? 's' : ''}
            </span>
          )}

          {/* Sort dropdown */}
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            style={{
              padding: '7px 10px', borderRadius: 8, border: '1px solid #E5E0D8',
              background: '#FFFFFF', color: '#44403C', fontSize: 13,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          <button onClick={() => setShowImport(true)} style={ghostBtn}>
            🔗 Import from URL
          </button>
          <button onClick={() => { setImportDefaults(null); setModal({ mode: 'form' }) }} style={primaryBtn}>
            + Add Recipe
          </button>
        </header>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>

          {/* Connection error */}
          {error && (
            <div style={{
              padding: '14px 16px', background: '#FEF2F2', border: '1px solid #FCA5A5',
              borderRadius: 10, color: '#DC2626', fontSize: 14, marginBottom: 16,
            }}>
              <strong>Database error:</strong> {error}
              <br /><span style={{ fontSize: 12, color: '#EF4444' }}>Check that your .env file has the correct VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.</span>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', color: '#A8A29E', fontSize: 15 }}>
              Loading recipes…
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && filtered.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh', gap: 12, color: '#A8A29E', textAlign: 'center' }}>
              <span style={{ fontSize: 48, opacity: 0.5 }}>🍽️</span>
              <p style={{ fontSize: 15, fontWeight: 500, color: '#78716C' }}>
                {search ? `No recipes match "${search}"` : 'No recipes here yet'}
              </p>
              {!search && (
                <button onClick={() => setModal({ mode: 'form' })} style={primaryBtn}>
                  + Add your first recipe
                </button>
              )}
            </div>
          )}

          {/* Recipe grid */}
          {!loading && filtered.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 14,
            }}>
              {filtered.map(r => (
                <RecipeCard key={r.id} recipe={r} onClick={() => openRecipe(r.id)} />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {modal?.mode === 'view' && currentRecipe && (
        <ViewModal
          recipe={currentRecipe}
          onClose={() => setModal(null)}
          onEdit={() => setModal({ mode: 'form', id: currentRecipe.id })}
          onDelete={() => handleDelete(currentRecipe.id)}
        />
      )}

      {modal?.mode === 'form' && (
        <FormModal
          recipe={currentRecipe ?? importDefaults}
          onClose={() => { setModal(null); setImportDefaults(null) }}
          onSave={handleSave}
          onDelete={currentRecipe ? () => handleDelete(currentRecipe.id) : null}
          saving={saving}
        />
      )}

      {showImport && (
        <ImportModal
          onClose={() => setShowImport(false)}
          onImported={handleImported}
        />
      )}
    </div>
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