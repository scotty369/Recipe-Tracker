import { useState } from 'react'
import { CATEGORIES, DIFFICULTY, TAGS, EMOJIS } from '../constants'
import ModalShell from './ModalShell'

const defaultForm = {
  title: '', category: 'dinner', emoji: '📄',
  servings: '', time: '', difficulty: 'Medium',
  ingredients: [{ qty: '', name: '' }],
  instructions: '', notes: '', tags: [],
}

export default function FormModal({ recipe, onClose, onSave, onDelete, saving }) {
  const isEdit = !!recipe
  const [form, setForm] = useState(() => {
    if (recipe) return { ...recipe, ingredients: recipe.ingredients?.map(i => ({ ...i })) || [{ qty: '', name: '' }] }
    return { ...defaultForm, sub: CATEGORIES.find(c => c.id === 'dinner').subs[0] }
  })
  const [error, setError] = useState(null)

  const catSubs = CATEGORIES.find(c => c.id === form.category)?.subs || []

  function set(k, v) { setForm(p => ({ ...p, [k]: v })) }

  function setCat(catId) {
    const subs = CATEGORIES.find(c => c.id === catId)?.subs || []
    setForm(p => ({ ...p, category: catId, sub: subs[0] || '' }))
  }

  function setIngr(i, k, v) {
    setForm(p => {
      const ingrs = [...p.ingredients]
      ingrs[i] = { ...ingrs[i], [k]: v }
      return { ...p, ingredients: ingrs }
    })
  }
  function addIngr() { setForm(p => ({ ...p, ingredients: [...p.ingredients, { qty: '', name: '' }] })) }
  function removeIngr(i) { setForm(p => ({ ...p, ingredients: p.ingredients.filter((_, j) => j !== i) })) }

  function toggleTag(t) {
    setForm(p => ({ ...p, tags: p.tags?.includes(t) ? p.tags.filter(x => x !== t) : [...(p.tags || []), t] }))
  }

  async function handleSave() {
    if (!form.title.trim()) { setError('Please enter a recipe name.'); return }
    setError(null)
    const cleaned = { ...form, ingredients: form.ingredients.filter(i => i.name.trim()) }
    await onSave(cleaned)
  }

  function handleDelete() {
    if (window.confirm('Delete this recipe? This cannot be undone.')) onDelete()
  }

  return (
    <ModalShell onClose={onClose} wide>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{isEdit ? 'Edit Recipe' : 'New Recipe'}</h2>
        <button onClick={onClose} style={ghostBtn}>✕</button>
      </div>

      {error && (
        <div style={{ padding: '10px 12px', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 8, color: '#DC2626', fontSize: 13, marginBottom: 14 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Title + emoji */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10 }}>
          <Field label="Recipe name *">
            <input value={form.title} onChange={e => set('title', e.target.value)}
              placeholder="e.g. Grandma's Banana Bread" style={inp} />
          </Field>
          <Field label="Icon">
            <select value={form.emoji} onChange={e => set('emoji', e.target.value)} style={{ ...inp, width: 72 }}>
              {EMOJIS.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </Field>
        </div>

        {/* Category + sub */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field label="Category">
            <select value={form.category} onChange={e => setCat(e.target.value)} style={inp}>
              {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
            </select>
          </Field>
          <Field label="Subcategory">
            <select value={form.sub} onChange={e => set('sub', e.target.value)} style={inp}>
              {catSubs.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
        </div>

        {/* Meta */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          <Field label="Servings">
            <input value={form.servings} onChange={e => set('servings', e.target.value)} placeholder="4" style={inp} />
          </Field>
          <Field label="Cook time">
            <input value={form.time} onChange={e => set('time', e.target.value)} placeholder="30 min" style={inp} />
          </Field>
          <Field label="Difficulty">
            <select value={form.difficulty} onChange={e => set('difficulty', e.target.value)} style={inp}>
              {DIFFICULTY.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </Field>
        </div>

        {/* Ingredients */}
        <Field label="Ingredients">
          {form.ingredients.map((ing, i) => (
            <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
              <input value={ing.qty} onChange={e => setIngr(i, 'qty', e.target.value)}
                placeholder="Qty / amount" style={{ ...inp, width: 110 }} />
              <input value={ing.name} onChange={e => setIngr(i, 'name', e.target.value)}
                placeholder="Ingredient" style={{ ...inp, flex: 1 }} />
              <button onClick={() => removeIngr(i)} style={{ ...ghostBtn, padding: '0 10px', fontSize: 16, color: '#A8A29E' }}>✕</button>
            </div>
          ))}
          <button onClick={addIngr} style={{ ...ghostBtn, fontSize: 13, marginTop: 2 }}>+ Add ingredient</button>
        </Field>

        {/* Instructions */}
        <Field label="Instructions">
          <textarea value={form.instructions} onChange={e => set('instructions', e.target.value)}
            placeholder="Step-by-step instructions…" rows={5}
            style={{ ...inp, resize: 'vertical', lineHeight: 1.6 }} />
        </Field>

        {/* Notes */}
        <Field label="Notes & tips">
          <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
            placeholder="Optional — variations, substitutions, serving suggestions…" rows={2}
            style={{ ...inp, resize: 'vertical' }} />
        </Field>

        {/* Tags */}
        <Field label="Tags">
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {TAGS.map(t => {
              const sel = form.tags?.includes(t)
              return (
                <button key={t} onClick={() => toggleTag(t)} style={{
                  fontSize: 12, padding: '4px 10px', borderRadius: 10,
                  cursor: 'pointer', border: '1px solid',
                  background: sel ? '#FFF3E6' : 'transparent',
                  borderColor: sel ? '#FB923C' : '#D6D3D1',
                  color: sel ? '#C2410C' : '#78716C',
                  fontWeight: sel ? 600 : 400,
                }}>{t}</button>
              )
            })}
          </div>
        </Field>
      </div>

      {/* Footer */}
      <div style={{
        display: 'flex', gap: 8, justifyContent: 'flex-end',
        marginTop: 20, paddingTop: 14, borderTop: '1px solid #E5E0D8',
      }}>
        {onDelete && (
          <button onClick={handleDelete} style={{ ...ghostBtn, color: '#DC2626', borderColor: '#FCA5A5' }}>
            🗑 Delete
          </button>
        )}
        <button onClick={onClose} style={ghostBtn}>Cancel</button>
        <button onClick={handleSave} disabled={saving} style={{ ...primaryBtn, opacity: saving ? 0.7 : 1 }}>
          {saving ? 'Saving…' : 'Save Recipe'}
        </button>
      </div>
    </ModalShell>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#78716C', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </label>
      {children}
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
const inp = {
  width: '100%', padding: '8px 10px', borderRadius: 8,
  border: '1px solid #E5E0D8', fontSize: 14, color: '#1C1917',
  background: '#FAFAFA', fontFamily: 'inherit', boxSizing: 'border-box',
}
