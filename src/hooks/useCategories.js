import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

// Categories are a small, fixed set seeded server-side (see supabase/seed.sql).
// Alphabetical order doesn't match the intended display order, so we sort
// client-side against this fixed list; anything unrecognized sorts last.
const CATEGORY_ORDER = ['Comida', 'Compras', 'Ocio', 'Viajes', 'Suscripciones']

export function useCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('categories')
        .select('*, subcategories(*)')
        .order('name', { foreignTable: 'subcategories' })

      if (cancelled) return

      if (fetchError) {
        setError(fetchError.message)
      } else {
        const sorted = [...data].sort(
          (a, b) => CATEGORY_ORDER.indexOf(a.name) - CATEGORY_ORDER.indexOf(b.name),
        )
        setCategories(sorted)
        setError(null)
      }
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  return { categories, loading, error }
}
