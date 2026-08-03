import { HelpCircle, icons } from 'lucide-react'

const SIZES = {
  sm: { wrapper: 'h-8 w-8', icon: 14 },
  md: { wrapper: 'h-10 w-10', icon: 18 },
  lg: { wrapper: 'h-12 w-12', icon: 22 },
}

// DB/seed data stores Lucide's kebab-case icon names (e.g. "utensils-crossed");
// lucide-react's `icons` map is keyed by PascalCase (e.g. "UtensilsCrossed").
function kebabToPascalCase(name) {
  return name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
}

export function CategoryIcon({ icon, color, size = 'md', className = '' }) {
  const IconComponent = icons[kebabToPascalCase(icon)] ?? HelpCircle
  const { wrapper, icon: iconSize } = SIZES[size] ?? SIZES.md

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full ${wrapper} ${className}`}
      style={{ backgroundColor: `${color}33` }}
    >
      <IconComponent size={iconSize} strokeWidth={2.25} style={{ color }} aria-hidden="true" />
    </span>
  )
}
