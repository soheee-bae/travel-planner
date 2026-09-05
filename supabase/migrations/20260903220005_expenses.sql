create table expenses (
  id             uuid primary key default gen_random_uuid(),
  trip_id        uuid not null references trips(id) on delete cascade,
  title          text not null check (char_length(title) between 1 and 120),
  category       expense_category not null,
  amount         numeric(12, 2) not null check (amount >= 0),
  currency       char(3) not null,
  date           date not null,
  day_index       smallint check (day_index > 0),
  payment_method payment_method not null,
  paid_by        text,
  -- 장소를 지울 때 비용 기록까지 함께 지우면 안 된다 — 연결만 끊는다.
  place_id       uuid references places(id) on delete set null,
  memo           text,
  -- 장소의 예상비용에서 자동 생성된 항목인지 여부. 사용자가 직접 수정한
  -- 뒤에는 자동 재생성이 덮어쓰지 않도록 보호하는 플래그(docs/06 §6.6).
  is_manual      boolean not null default true,
  created_at     timestamptz not null default now()
);

create index expenses_trip_id_idx on expenses (trip_id);
create index expenses_trip_day_idx on expenses (trip_id, day_index);
create index expenses_place_id_idx on expenses (place_id) where place_id is not null;
