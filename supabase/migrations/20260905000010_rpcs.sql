-- P10-06: Day 배정·회수·순서 재정렬을 한 트랜잭션으로 처리하는 RPC.
-- 앱은 행을 하나씩 PATCH하지 않고 이 함수만 호출한다.

create or replace function assign_places_to_day(
  p_trip_id uuid,
  p_place_ids uuid[],
  p_day_index smallint
)
returns integer
language plpgsql
security invoker
set search_path = public
as $$
declare
  updated_count integer;
begin
  if p_day_index is not null and p_day_index <= 0 then
    raise exception 'day_index must be positive or null';
  end if;

  if not is_trip_owner(p_trip_id) then
    raise exception 'not trip owner';
  end if;

  update places
     set day_index = p_day_index
   where trip_id = p_trip_id
     and id = any(p_place_ids);

  get diagnostics updated_count = row_count;
  return updated_count;
end;
$$;

create or replace function reclaim_places_beyond_day(
  p_trip_id uuid,
  p_max_day smallint
)
returns integer
language plpgsql
security invoker
set search_path = public
as $$
declare
  updated_count integer;
begin
  if not is_trip_owner(p_trip_id) then
    raise exception 'not trip owner';
  end if;

  -- 박수를 줄이면 잘리는 Day의 장소는 삭제하지 않고 미배정으로 되돌린다
  -- (docs/08 P3-04).
  update places
     set day_index = null
   where trip_id = p_trip_id
     and day_index is not null
     and day_index > p_max_day;

  get diagnostics updated_count = row_count;
  return updated_count;
end;
$$;

create or replace function reorder_places(
  p_trip_id uuid,
  p_items jsonb
)
returns integer
language plpgsql
security invoker
set search_path = public
as $$
declare
  updated_count integer := 0;
  item jsonb;
begin
  if not is_trip_owner(p_trip_id) then
    raise exception 'not trip owner';
  end if;

  -- p_items: [{ "id": "<uuid>", "order_index": 1.5 }, ...]
  for item in select value from jsonb_array_elements(p_items)
  loop
    update places
       set order_index = (item->>'order_index')::double precision
     where trip_id = p_trip_id
       and id = (item->>'id')::uuid;
    updated_count := updated_count + 1;
  end loop;

  return updated_count;
end;
$$;
