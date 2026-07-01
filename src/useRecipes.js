import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabaseClient'

export function useRecipes() {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchRecipes = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      setRecipes(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchRecipes() }, [fetchRecipes])

  async function addRecipe(recipe) {
    const { data, error } = await supabase
      .from('recipes')
      .insert([recipe])
      .select()
      .single()

    if (error) throw new Error(error.message)
    setRecipes(prev => [data, ...prev])
    return data
  }

  async function updateRecipe(id, updates) {
    const { data, error } = await supabase
      .from('recipes')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    setRecipes(prev => prev.map(r => r.id === id ? data : r))
    return data
  }

  async function deleteRecipe(id) {
    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', id)

    if (error) throw new Error(error.message)
    setRecipes(prev => prev.filter(r => r.id !== id))
  }

  return { recipes, loading, error, addRecipe, updateRecipe, deleteRecipe, refetch: fetchRecipes }
}
