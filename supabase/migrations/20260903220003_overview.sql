create table accommodations (
  id             uuid primary key default gen_random_uuid(),
  trip_id        uuid not null references trips(id) on delete cascade,
  name           text not null check (char_length(name) >= 1),
  checkin_date   date not null,
  checkout_date  date not null,
  checkin_time   time,
  checkout_time  time,
  address        text,
  booking_ref    text,
  cost           numeric(12, 2) check (cost >= 0),
  memo           text,
  created_at     timestamptz not null default now(),
  constraint accommodations_date_order check (checkout_date >= checkin_date)
);

create index accommodations_trip_id_idx on accommodations (trip_id);

create table transports (
  id             uuid primary key default gen_random_uuid(),
  trip_id        uuid not null references trips(id) on delete cascade,
  type           transport_type not null,
  departure_from text not null check (char_length(departure_from) >= 1),
  arrival_to     text not null check (char_length(arrival_to) >= 1),
  departure_at   timestamp not null,
  arrival_at     timestamp not null,
  booking_ref    text,
  cost           numeric(12, 2) check (cost >= 0),
  memo           text,
  created_at     timestamptz not null default now()
);

create index transports_trip_id_idx on transports (trip_id);
