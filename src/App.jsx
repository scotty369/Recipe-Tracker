import { useState } from 'react'
import { useRecipes } from './useRecipes'
import { getCatIcon, getCatLabel } from './constants'
import Sidebar from './components/Sidebar'
import RecipeCard from './components/RecipeCard'
import ViewModal from './components/ViewModal'
import FormModal from './components/FormModal'

export default function App() {
  const { recipes, loading, error, addRecipe, updateRecipe, deleteRecipe } = useRecipes()
  const [filter, setFilter] = useState({ type: 'all' })
  const [search, setSearch] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [modal, setModal] = useState(null) // null | {mode:'view',id} | {mode:'form',id?}
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)

  // ── Filtering ──────────────────────────────────────────────────────────────
  function getFiltered() {
    return recipes.filter(r => {
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
  }

  // ── Save handler (add or update) ──────────────────────────────────────────
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
    } catch (e) {
      setSaveError(e.message)
    } finally {
      setSaving(false)
    }
  }

  // ── Delete handler ────────────────────────────────────────────────────────
  async function handleDelete(id) {
    try {
      await deleteRecipe(id)
      setModal(null)
    } catch (e) {
      alert('Failed to delete: ' + e.message)
    }
  }

  const filtered = getFiltered()
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
          filter={filter} setFilter={setFilter}
          search={search} setSearch={setSearch}
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
          <button onClick={() => setModal({ mode: 'form' })} style={primaryBtn}>
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
                <RecipeCard key={r.id} recipe={r} onClick={() => setModal({ mode: 'view', id: r.id })} />
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
          recipe={currentRecipe}
          onClose={() => setModal(null)}
          onSave={handleSave}
          onDelete={currentRecipe ? () => handleDelete(currentRecipe.id) : null}
          saving={saving}
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
