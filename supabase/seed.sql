-- Seed a demo workspace for the currently logged-in user.
-- Run from SQL Editor while authenticated.
insert into public.workspaces (owner_id, name, industry, brand_voice)
values (
  auth.uid(),
  'Northwind Studio',
  'Branding & creative services',
  'Confident, warm, plainspoken. Avoid jargon and emojis.'
)
returning id;

-- Then copy the returned UUID and seed the rest:
-- insert into public.memory_items (workspace_id, title, content, category, pinned)
-- values ('<uuid>', 'Brand voice', '...', 'brand', true);
