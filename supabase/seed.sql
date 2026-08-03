-- Gestor de gastos — fixed category/subcategory seed data
-- Run after schema.sql. Idempotent: safe to re-run (upserts by unique name).
-- Icon names are Lucide's kebab-case identifiers (https://lucide.dev/icons),
-- matching lucide-react's dynamicIconImports keys.

-- Colors tuned to clear the dataviz skill's colorblind-safety validator
-- (deutan/protan, adjacent + all-pairs) while keeping each category's
-- original hue family — see tailwind.config.js's `category` block.
insert into categories (name, icon, color) values
  ('Comida',         'utensils-crossed', '#6bb888'),
  ('Compras',        'shopping-bag',     '#c796d2'),
  ('Ocio',           'party-popper',     '#1f8dae'),
  ('Viajes',         'plane',            '#b48637'),
  ('Suscripciones',  'repeat',           '#934d37')
on conflict (name) do update set icon = excluded.icon, color = excluded.color;

insert into subcategories (category_id, name, icon)
select c.id, s.name, s.icon
from categories c
join (values
  ('Comida',  'Supermercado', 'shopping-cart'),
  ('Comida',  'Restaurantes', 'utensils'),
  ('Comida',  'Delivery',     'bike'),

  ('Compras', 'Ropa',         'shirt'),
  ('Compras', 'Deporte',      'dumbbell'),
  ('Compras', 'Videojuegos',  'gamepad-2'),
  ('Compras', 'Regalos',      'gift'),
  ('Compras', 'Otros',        'ellipsis'),

  ('Viajes',  'Transporte',        'car'),
  ('Viajes',  'Alojamiento',       'bed-double'),
  ('Viajes',  'Gastos del viaje',  'wallet')
) as s(category_name, name, icon)
  on s.category_name = c.name
on conflict (category_id, name) do update set icon = excluded.icon;
