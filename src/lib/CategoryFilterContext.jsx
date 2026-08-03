import { createContext, useContext, useMemo, useState } from 'react'

const CategoryFilterContext = createContext(null)

// Shared category/subcategory filter for the desktop Dashboard + Gastos
// screens, so the selection survives navigating between them without the
// user having to reselect it (see DesktopLayout, which mounts this once).
export function CategoryFilterProvider({ children }) {
  const [categoryId, setCategoryId] = useState(null)
  const [subcategoryId, setSubcategoryId] = useState(null)

  function selectCategory(id) {
    setCategoryId(id)
    setSubcategoryId(null)
  }

  function selectSubcategory(id) {
    setSubcategoryId(id)
  }

  function clear() {
    setCategoryId(null)
    setSubcategoryId(null)
  }

  const value = useMemo(
    () => ({ categoryId, subcategoryId, selectCategory, selectSubcategory, clear }),
    [categoryId, subcategoryId],
  )

  return <CategoryFilterContext.Provider value={value}>{children}</CategoryFilterContext.Provider>
}

export function useCategoryFilter() {
  const context = useContext(CategoryFilterContext)
  if (!context) throw new Error('useCategoryFilter must be used within a CategoryFilterProvider')
  return context
}
