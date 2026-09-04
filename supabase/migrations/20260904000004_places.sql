create table places (
  id               uuid primary key default gen_random_uuid(),
  trip_id          uuid not null references trips(id) on delete cascade,
  name             text not null check (char_length(name) between 1 and 120),
  category         place_category not null,
  address          text,
  lat              double precision check (lat between -90 and 90),
  lng              double precision check (lng between -180 and 180),
  business_hours   text,
  closed_days      text,
  estimated_cost   numeric(12, 2) check (estimated_cost >= 0),
  cost_currency    char(3),
  duration_min     smallint check (duration_min >= 0),
  priority         place_priority not null default '가능하면',
  day_index        smallint check (day_index > 0),
  order_index      double precision not null default 0,
  memo             text,
  link_url         text,
  photo_url        text,
  tags             text[] not null default '{}',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index places_trip_id_idx on places (trip_id);
create index places_trip_day_idx on places (trip_id, day_index, order_index);
create index places_coords_idx on places (trip_id) where lat is not null and lng is not null;

create trigger places_touch_updated_at
  before update on places
  for each row execute function touch_updated_at();
