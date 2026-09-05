create table trips (
  id                  uuid primary key default gen_random_uuid(),
  owner_id            uuid not null references auth.users(id) on delete cascade,
  title               text not null check (char_length(title) between 1 and 120),
  destination_country text not null,
  destination_city    text not null,
  start_date          date not null,
  end_date            date not null,
  companions          text not null,
  cover_emoji         text not null,
  base_currency       char(3) not null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint trips_date_order check (end_date >= start_date)
);

create index trips_owner_id_idx on trips (owner_id);

create function touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trips_touch_updated_at
  before update on trips
  for each row execute function touch_updated_at();
