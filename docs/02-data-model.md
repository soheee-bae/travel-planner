# 02. 데이터 모델

## 2.1 설계 원칙

1. **후보 풀과 확정 일정을 분리한다.**
   `places`는 "가고 싶은 곳 목록", `itinerary_items`는 "특정 날짜에 배치된 것".
   `itinerary_items.day_id IS NULL`이면 아직 어느 날에 갈지 안 정한 상태다.
   이 하나가 "일단 리스트업하고 당일에 근처 것 중 고른다"는 워크플로우를 지탱한다.

2. **순서는 소수(fractional index)로 저장한다.**
   `sort_order double precision`. 카드를 옮기면 앞뒤 값의 중간값을 계산해 **그 행 하나만**
   UPDATE한다. 정수 순번이면 매번 리스트 전체를 다시 써야 해서 드래그가 눈에 띄게 느려진다.

3. **시간은 `date` + `time`으로 나눠 저장한다.**
   `trip_days.date`(날짜) + `itinerary_items.start_time`(현지 시각). 여행 전체 시간대는
   `trips.timezone`에 둔다. `timestamptz`로 저장하면 "5월 22일 09:00에 지브리 파크"라는
   현지 기준 계획이 보는 사람의 시간대에 따라 흔들린다.

4. **권한 판정은 함수 하나로 모은다.**
   모든 RLS 정책이 `is_trip_member(trip_id)`를 호출한다. 나중에 동행자 공동 편집을
   붙일 때 이 함수 하나만 바꾸면 되고, 테이블 10개의 정책을 다시 쓰지 않는다.

5. **집계는 DB View가 계산한다.**
   프론트에서 합계를 돌리지 않는다. 항목 하나를 수정하면 View 결과만 다시 받아
   총액·카테고리 비율·일자별 소계가 자동으로 맞는다.

## 2.2 ERD

```
auth.users
    │
    │ 1:N
    ▼
  trips ──1:N──► trip_days ──1:N──► itinerary_items ──N:1──► places
    │                 │                    │                    │
    │                 │ N:1                │ 1:N                │ 1:N
    │                 ▼                    ▼                    ▼
    │             bookings            transit_legs          place_photos
    │            (숙소/항공)          (앞 항목→뒤 항목)
    │
    ├──1:N──► expenses ──N:1──► itinerary_items (선택)
    ├──1:N──► trip_members  (동행자. 1단계에서는 소유자 1행만)
    └──1:1──► share_links   (읽기 전용 공개 링크)

  route_cache  ← 여행과 무관한 전역 캐시. (좌표쌍, 이동수단) → 소요시간/거리
```

## 2.3 열거형(enum)

```sql
create type place_category as enum (
  'sight',      -- 관광
  'food',       -- 식사
  'cafe',       -- 카페
  'shop',       -- 쇼핑
  'stay',       -- 숙소
  'transport',  -- 교통 (역, 공항)
  'etc'
);

create type item_kind as enum (
  'place',      -- 후보 풀의 장소 방문
  'move',       -- 이동 구간 (스크린샷의 "센트레아 도착 → 뮤스카이 → 사카에역")
  'custom'      -- 자유 메모 블록
);

create type travel_mode as enum ('walk', 'transit', 'car', 'bike', 'train', 'plane');

create type expense_category as enum (
  'sight', 'food', 'cafe', 'shop', 'transport', 'move', 'stay', 'etc'
);

create type booking_kind as enum ('flight', 'lodging', 'train', 'bus', 'rental', 'ticket');
```

`place_category`와 `expense_category`를 분리한 이유: 비용은 "교통비(fare)"와
"이동 구간(move)"을 따로 봐야 한다. 스크린샷 비용 뷰의 파이차트가 `관광/교통/식사/이동`
4분류로 나뉘어 있는 것과 동일한 구조다.

## 2.4 테이블

아래는 읽기 순서대로 배치했다. **실제 마이그레이션 실행 순서는 참조 관계를 따른다:**
`trips` → `places` → `trip_days`(`stay_id`가 `places`를 참조) → `itinerary_items`
→ `transit_legs` / `expenses` / `bookings` → `trip_members` / `share_links`.

### trips

```sql
create table trips (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid not null references auth.users(id) on delete cascade,
  title        text not null check (length(title) between 1 and 120),
  destination  text,                                  -- '나고야, 일본'
  start_date   date not null,
  end_date     date not null,
  timezone     text not null default 'Asia/Tokyo',
  currency     char(3) not null default 'JPY',         -- 현지 통화
  home_currency char(3) not null default 'KRW',        -- 환산 표시용
  fx_rate      numeric(14,6),                          -- 여행 시작 시점 스냅샷
  headcount    smallint not null default 1 check (headcount > 0),
  budget       numeric(12,2),
  cover_url    text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint trips_date_order check (end_date >= start_date),
  constraint trips_duration_sane check (end_date - start_date <= 60)
);
```

`nights = end_date - start_date`, `days = nights + 1`. "몇박 몇일"을 컬럼으로 두지 않고
날짜에서 파생시킨다. 두 값을 따로 저장하면 반드시 어긋난다.

### trip_days

```sql
create table trip_days (
  id         uuid primary key default gen_random_uuid(),
  trip_id    uuid not null references trips(id) on delete cascade,
  day_index  smallint not null check (day_index >= 1),   -- 1일차, 2일차...
  date       date not null,
  title      text,                                       -- '지브리 파크 & 도요타'
  base_area  geography(Point, 4326),                      -- 그 날의 중심. 반경 필터 기준
  stay_id    uuid references places(id) on delete set null,
  note       text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (trip_id, day_index),
  unique (trip_id, date)
);
```

`trips`의 기간이 바뀌면 `resize_trip_days()` RPC가 이 테이블을 맞춘다(§2.5).

### places — 후보 풀

```sql
create table places (
  id          uuid primary key default gen_random_uuid(),
  trip_id     uuid not null references trips(id) on delete cascade,
  name        text not null,
  category    place_category not null default 'sight',
  address     text,
  lat         double precision check (lat between -90 and 90),
  lng         double precision check (lng between -180 and 180),
  geog        geography(Point, 4326)
                generated always as (
                  case when lat is null or lng is null then null
                  else st_setsrid(st_makepoint(lng, lat), 4326)::geography end
                ) stored,
  opening_hours jsonb,        -- { mon: [["11:00","22:00"]], ... , exceptions: [...] }
  est_cost      numeric(12,2),
  est_duration_min smallint,  -- 머무는 시간. 순서 최적화의 입력값
  priority      smallint not null default 0,   -- 2 필수 / 1 가고싶음 / 0 여유되면
  url           text,
  memo          text,
  tags          text[] not null default '{}',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index places_trip_idx on places (trip_id);
create index places_geog_idx on places using gist (geog);
create index places_category_idx on places (trip_id, category);
```

`geog`는 **생성 컬럼**이다. `lat`/`lng`만 쓰면 PostGIS 컬럼이 자동으로 따라오므로
동기화가 깨질 수 없다. `st_makepoint`, `st_setsrid`는 immutable이라 STORED 생성 컬럼에
쓸 수 있다.

`opening_hours`를 jsonb로 둔 이유: 일본 음식점은 "11:00–14:30, 17:00–22:00" 같은
중간 휴게(중휴)와 부정기 휴무가 흔해서 컬럼으로 정규화하면 표현력이 부족하다.
스크린샷의 `🕐 11:00~22:00`, `🕐 10:00~20:00` 표기가 여기서 나온다.

### itinerary_items — 확정 일정

```sql
create table itinerary_items (
  id         uuid primary key default gen_random_uuid(),
  trip_id    uuid not null references trips(id) on delete cascade,
  day_id     uuid references trip_days(id) on delete set null,   -- NULL = 미배치
  place_id   uuid references places(id) on delete cascade,
  kind       item_kind not null default 'place',
  title      text,             -- kind='move'/'custom' 일 때 직접 입력
  start_time time,
  end_time   time,
  sort_order double precision not null,
  mode       travel_mode,      -- kind='move' 일 때의 이동수단
  memo       text,
  locked     boolean not null default false,  -- 자동 재배치에서 제외 (예약 시간 고정)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint items_time_order check (end_time is null or start_time is null
                                     or end_time >= start_time),
  constraint items_has_subject check (place_id is not null or title is not null)
);

create index items_day_order_idx on itinerary_items (trip_id, day_id, sort_order);
create index items_unassigned_idx on itinerary_items (trip_id)
  where day_id is null;
create index items_place_idx on itinerary_items (place_id);
```

`day_id`에 `on delete set null`을 준 것이 의도적이다. 여행 기간을 줄여서 3일차가
사라지면 거기 있던 항목이 **삭제되지 않고 미배치 상태로 돌아온다.** 사용자가 애써
모은 장소를 날짜 조정 한 번으로 잃지 않는다.

`items_unassigned_idx`는 부분 인덱스다. "미배치 N개" 배지를 매번 세는 쿼리가 전체
스캔을 하지 않게 한다.

### transit_legs — 항목 간 이동

```sql
create table transit_legs (
  id           uuid primary key default gen_random_uuid(),
  trip_id      uuid not null references trips(id) on delete cascade,
  from_item_id uuid not null references itinerary_items(id) on delete cascade,
  to_item_id   uuid not null references itinerary_items(id) on delete cascade,
  mode         travel_mode not null default 'walk',
  duration_min smallint,
  distance_m   integer,
  fare         numeric(12,2),          -- 대중교통 요금. 대부분 수동 입력
  polyline     text,                    -- encoded polyline. 지도 경로선
  source       text not null default 'estimate',  -- estimate | osrm | provider | manual
  computed_at  timestamptz,
  unique (from_item_id, to_item_id, mode)
);
```

스크린샷 카드 사이의 `🚶 5m` pill이 이 테이블의 `duration_min`이다.
`source='estimate'`는 직선거리 기반 추정, `'manual'`은 사용자가 직접 고친 값으로
자동 재계산이 덮어쓰지 않는다.

### route_cache — 전역 경로 캐시

```sql
create table route_cache (
  id           bigserial primary key,
  mode         travel_mode not null,
  from_lat     numeric(8,5) not null,     -- 소수 5자리 ≈ 1.1m 정밀도로 반올림
  from_lng     numeric(8,5) not null,
  to_lat       numeric(8,5) not null,
  to_lng       numeric(8,5) not null,
  duration_min smallint not null,
  distance_m   integer not null,
  polyline     text,
  provider     text not null,
  created_at   timestamptz not null default now(),
  unique (mode, from_lat, from_lng, to_lat, to_lng)
);
```

좌표를 소수 5자리로 반올림해 유니크 키로 쓴다. 같은 구간을 다시 조회하지 않으므로
외부 라우팅 API 호출량이 크게 줄고, 여행이 여러 개여도 캐시를 공유한다.
여행 데이터가 아니므로 로그인 사용자 전체가 읽을 수 있게 하고, 쓰기는 Route Handler
(service role)만 한다.

### expenses

```sql
create table expenses (
  id         uuid primary key default gen_random_uuid(),
  trip_id    uuid not null references trips(id) on delete cascade,
  day_id     uuid references trip_days(id) on delete set null,
  item_id    uuid references itinerary_items(id) on delete set null,
  category   expense_category not null,
  label      text not null,
  amount     numeric(12,2) not null check (amount >= 0),
  currency   char(3) not null default 'JPY',
  is_actual  boolean not null default false,   -- false=예상, true=실제 지출
  paid_by    text,
  method     text,                              -- cash | card | ic
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index expenses_trip_day_idx on expenses (trip_id, day_id);
```

예상/실제를 같은 테이블의 플래그로 구분한다. 여행 전에는 예상만 보고, 여행 중에는
실제를 입력하면서 비용 뷰에서 두 값을 나란히 비교한다.

### bookings

```sql
create table bookings (
  id         uuid primary key default gen_random_uuid(),
  trip_id    uuid not null references trips(id) on delete cascade,
  kind       booking_kind not null,
  title      text not null,          -- '호텔 악텔 나고야 니시키'
  confirmation_no text,
  starts_at  timestamptz,
  ends_at    timestamptz,
  place_id   uuid references places(id) on delete set null,
  amount     numeric(12,2),
  currency   char(3),
  url        text,
  memo       text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

항공·숙소·신칸센처럼 **이미 확정된 것**은 일정과 별도로 관리한다. 여기에 넣으면
"예약 뷰"에서 모아 보고, 필요할 때 `itinerary_items`로 배치한다.

### trip_members / share_links

```sql
create table trip_members (
  trip_id  uuid not null references trips(id) on delete cascade,
  user_id  uuid not null references auth.users(id) on delete cascade,
  role     text not null default 'editor' check (role in ('owner','editor','viewer')),
  created_at timestamptz not null default now(),
  primary key (trip_id, user_id)
);

create table share_links (
  token      text primary key default encode(gen_random_bytes(16), 'hex'),
  trip_id    uuid not null references trips(id) on delete cascade,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);
```

1단계에서는 `trip_members`에 소유자 1행만 자동 생성한다. 테이블을 미리 만들어두는
비용은 거의 없고, 나중에 동행자 초대를 붙일 때 마이그레이션이 훨씬 가벼워진다.

## 2.5 RPC — 여러 행을 한 트랜잭션으로

클라이언트에서 UPDATE를 루프로 돌리면 중간에 실패했을 때 데이터가 반쯤 망가진다.
아래는 모두 `security invoker`로 두어 RLS가 그대로 적용된다.

| 함수 | 용도 |
| --- | --- |
| `resize_trip_days(p_trip_id, p_start, p_end)` | 기간 변경 시 `trip_days` 생성/삭제. 삭제되는 날의 항목은 미배치로 회수 |
| `move_items_to_day(p_item_ids uuid[], p_day_id, p_after_order)` | 멀티셀렉트한 항목들을 DAY N 끝(또는 지정 위치)으로 이동. 순서 재계산 포함 |
| `reorder_item(p_item_id, p_prev_id, p_next_id)` | 드롭 위치의 앞뒤 항목만 받아 중간값 계산. 간격이 부족하면 해당 day만 재정규화 |
| `unassign_items(p_item_ids uuid[])` | 후보 풀로 되돌리기 |
| `nearby_places(p_trip_id, p_lat, p_lng, p_radius_m)` | `ST_DWithin`으로 반경 내 후보 반환. "지금 위치 근처 내 리스트" |
| `suggest_day_clusters(p_trip_id, p_k)` | `ST_ClusterKMeans`로 미배치 후보를 k개 그룹으로 묶어 반환 (배치는 하지 않음) |
| `duplicate_trip(p_trip_id)` | 여행 복제 (다음 여행에 장소 재사용) |

`reorder_item`의 재정규화 조건: 앞뒤 `sort_order` 차이가 `1e-6` 미만이면 그 day의
항목을 `1024` 간격으로 다시 매긴다. double precision 정밀도 고갈을 막는 안전장치다.

`suggest_day_clusters`가 **배치까지 하지 않는 것이 의도**다. 제안만 반환하고 적용은
사용자가 결정한다. 상세는 [06-features-and-algorithms.md](06-features-and-algorithms.md).

## 2.6 집계 View

```sql
create view trip_cost_by_day with (security_invoker = on) as
select
  e.trip_id,
  e.day_id,
  d.date,
  d.day_index,
  e.is_actual,
  sum(e.amount) as subtotal
from expenses e
left join trip_days d on d.id = e.day_id
group by e.trip_id, e.day_id, d.date, d.day_index, e.is_actual;

create view trip_cost_by_category with (security_invoker = on) as
select trip_id, category, is_actual,
       sum(amount) as total,
       round(100.0 * sum(amount) / nullif(sum(sum(amount)) over (
         partition by trip_id, is_actual), 0), 0) as pct
from expenses
group by trip_id, category, is_actual;

create view trip_totals with (security_invoker = on) as
select t.id as trip_id,
       coalesce(sum(e.amount) filter (where not e.is_actual), 0) as estimated_total,
       coalesce(sum(e.amount) filter (where e.is_actual), 0)     as actual_total,
       t.budget,
       t.headcount,
       coalesce(sum(e.amount) filter (where not e.is_actual), 0) / t.headcount
         as estimated_per_person
from trips t
left join expenses e on e.trip_id = t.id
group by t.id, t.budget, t.headcount;
```

`security_invoker = on`이 핵심이다. 이게 없으면 View가 정의자 권한으로 실행되어
RLS를 우회한다(Postgres 15+ 기능).

`trip_cost_by_category.pct`가 스크린샷 파이차트의 `식사 65% / 이동 17% / 관광 10% / 교통 8%`를
그대로 만들어낸다. 프론트에서 비율을 계산하지 않는다.

## 2.7 RLS

```sql
alter table trips            enable row level security;
alter table trip_days        enable row level security;
alter table places           enable row level security;
alter table itinerary_items  enable row level security;
alter table transit_legs     enable row level security;
alter table expenses         enable row level security;
alter table bookings         enable row level security;
alter table trip_members     enable row level security;
alter table share_links      enable row level security;
alter table route_cache      enable row level security;

-- 모든 정책이 통과하는 단일 관문
create function is_trip_member(p_trip_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from trip_members m
    where m.trip_id = p_trip_id and m.user_id = auth.uid()
  );
$$;

create policy "member reads trip" on trips
  for select using (is_trip_member(id));
create policy "owner writes trip" on trips
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- 자식 테이블은 전부 동일한 형태
create policy "member rw places" on places
  for all using (is_trip_member(trip_id)) with check (is_trip_member(trip_id));
-- trip_days, itinerary_items, transit_legs, expenses, bookings 동일

create policy "authenticated reads route cache" on route_cache
  for select to authenticated using (true);
-- route_cache 쓰기 정책 없음 → service role(Route Handler)만 기록
```

`is_trip_member`가 `security definer`인 이유: `trip_members`에도 RLS가 걸려 있어서
정책 안에서 그 테이블을 읽으면 재귀 평가에 걸린다. `search_path`를 고정하는 것은
`security definer` 함수의 필수 안전 조치다.

`trips` INSERT 직후 `trip_members`에 소유자 행을 넣는 트리거가 필요하다.
없으면 방금 만든 여행을 자기도 못 읽는다.

```sql
create function add_owner_as_member() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into trip_members (trip_id, user_id, role)
  values (new.id, new.owner_id, 'owner')
  on conflict do nothing;
  return new;
end $$;

create trigger trips_add_owner after insert on trips
  for each row execute function add_owner_as_member();
```

공유 링크(`/share/[token]`)는 RLS로 풀지 않는다. 익명 사용자에게 RLS를 열어주는 대신
**Route Handler가 service role로 토큰을 검증하고 필요한 데이터만 반환**한다.
읽기 전용 경로에 익명 정책을 여는 것보다 사고 반경이 작다.

## 2.8 Realtime

```sql
alter publication supabase_realtime add table itinerary_items;
alter publication supabase_realtime add table places;
alter publication supabase_realtime add table expenses;
alter publication supabase_realtime add table trip_days;
```

클라이언트는 `trip_id` 하나로 채널을 열고 위 4개 테이블 변경을 필터링해 받는다.
집계 View는 Realtime 대상이 아니므로, 위 이벤트를 받으면 비용 관련 쿼리키를
`invalidate`한다.

## 2.9 공통 트리거

```sql
create function touch_updated_at() returns trigger
language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
```

`updated_at`이 있는 모든 테이블에 `before update` 트리거로 부착한다.
낙관적 업데이트의 충돌 감지와 오프라인 동기화에서 기준값이 된다.

## 2.10 타입 생성

```bash
pnpm supabase gen types typescript --local > src/shared/types/database.generated.ts
```

이 파일은 **직접 수정하지 않는다.** 앱에서 쓰는 도메인 타입은 Zod 스키마에서 파생시키고,
생성 타입과 어긋나면 컴파일 에러가 나도록 각 feature의 `schema.ts`에서 한 번 대조한다.

```ts
// features/places/schema.ts (형태 예시)
type PlaceRow = Database['public']['Tables']['places']['Row']
export const placeSchema = z.object({ /* ... */ })
export type Place = z.infer<typeof placeSchema>

// 스키마가 DB와 어긋나면 여기서 타입 에러
const _assert: PlaceRow extends Place ? true : never = true
```
