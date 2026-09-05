create table wishlist_items (
  id          uuid primary key default gen_random_uuid(),
  trip_id     uuid not null references trips(id) on delete cascade,
  icon        text not null,
  title       text not null check (char_length(title) between 1 and 60),
  content     text,
  order_index double precision not null default 0,
  created_at  timestamptz not null default now()
);

create index wishlist_items_trip_id_idx on wishlist_items (trip_id);
