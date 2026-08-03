import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabaseClient'

// Fetches the authenticated user's expenses, joined with their category and
// subcategory, optionally scoped by date range and/or category.
// `startDate`/`endDate` are inclusive 'YYYY-MM-DD' strings. Pass
// `enabled: false` to skip fetching (e.g. a comparison range that doesn't
// apply yet) without breaking the rules of hooks at the call site.
export function useExpenses({ startDate, endDate, categoryId, subcategoryId, enabled = true } = {}) {
  const { user } = useAuth()
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    if (!user || !enabled) {
      setExpenses([])
      setLoading(false)
      return undefined
    }
    let cancelled = false

    async function load() {
      setLoading(true)
      let query = supabase
        .from('expenses')
        .select('*, category:categories(id,name,icon,color), subcategory:subcategories(id,name,icon)')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })

      if (startDate) query = query.gte('date', startDate)
      if (endDate) query = query.lte('date', endDate)
      if (categoryId) query = query.eq('category_id', categoryId)
      if (subcategoryId) query = query.eq('subcategory_id', subcategoryId)

      const { data, error: fetchError } = await query
      if (cancelled) return

      if (fetchError) {
        setError(fetchError.message)
      } else {
        setExpenses(data)
        setError(null)
      }
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [user, startDate, endDate, categoryId, subcategoryId, enabled, reloadToken])

  const refetch = useCallback(() => setReloadToken((token) => token + 1), [])

  return { expenses, loading, error, refetch }
}
