import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

// Categories are a small, fixed set seeded server-side (see supabase/seed.sql).
// Alphabetical order doesn't match the intended display order, so we sort
// client-side against this fixed list; anything unrecognized sorts last.
const CATEGORY_ORDER = ['Comida', 'Compras', 'Ocio', 'Viajes', 'Suscripciones']

// Same idea for subcategories, but the order is only meaningful within a
// category (see supabase/seed.sql). Categories not listed here keep
// whatever order the query returns (alphabetical, via `.order('name', ...)`).
const SUBCATEGORY_ORDER = {
  Comida: ['Supermercado', 'Restaurantes', 'Delivery'],
  Compras: ['Ropa', 'Videojuegos', 'Deporte', 'Regalos', 'Otros'],
}

function sortSubcategories(category) {
  const order = SUBCATEGORY_ORDER[category.name]
  if (!order || !category.subcategories) return category
  return {
    ...category,
    subcategories: [...category.subcategories].sort(
      (a, b) => order.indexOf(a.name) - order.indexOf(b.name),
    ),
  }
}

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
        const sorted = [...data]
          .sort((a, b) => CATEGORY_ORDER.indexOf(a.name) - CATEGORY_ORDER.indexOf(b.name))
          .map(sortSubcategories)
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
