create table checklist_categories (
  id          uuid primary key default gen_random_uuid(),
  trip_id     uuid not null references trips(id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 40),
  icon        text not null,
  order_index double precision not null default 0,
  created_at  timestamptz not null default now()
);

create index checklist_categories_trip_id_idx on checklist_categories (trip_id);

create table checklist_items (
  id          uuid primary key default gen_random_uuid(),
  category_id uuid not null references checklist_categories(id) on delete cascade,
  trip_id     uuid not null references trips(id) on delete cascade,
  title       text not null check (char_length(title) between 1 and 120),
  is_checked  boolean not null default false,
  notes       text,
  order_index double precision not null default 0,
  created_at  timestamptz not null default now()
);

create index checklist_items_category_id_idx on checklist_items (category_id);
create index checklist_items_trip_id_idx on checklist_items (trip_id);
