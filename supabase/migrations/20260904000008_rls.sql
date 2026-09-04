create function is_trip_owner(p_trip_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from trips t
    where t.id = p_trip_id and t.owner_id = auth.uid()
  );
$$;

alter table trips                 enable row level security;
alter table accommodations        enable row level security;
alter table transports            enable row level security;
alter table places                enable row level security;
alter table expenses              enable row level security;
alter table checklist_categories  enable row level security;
alter table checklist_items       enable row level security;
alter table wishlist_items        enable row level security;

create policy "owner full access to trips" on trips
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "owner full access to accommodations" on accommodations
  for all using (is_trip_owner(trip_id)) with check (is_trip_owner(trip_id));

create policy "owner full access to transports" on transports
  for all using (is_trip_owner(trip_id)) with check (is_trip_owner(trip_id));

create policy "owner full access to places" on places
  for all using (is_trip_owner(trip_id)) with check (is_trip_owner(trip_id));

create policy "owner full access to expenses" on expenses
  for all using (is_trip_owner(trip_id)) with check (is_trip_owner(trip_id));

create policy "owner full access to checklist_categories" on checklist_categories
  for all using (is_trip_owner(trip_id)) with check (is_trip_owner(trip_id));

create policy "owner full access to checklist_items" on checklist_items
  for all using (is_trip_owner(trip_id)) with check (is_trip_owner(trip_id));

create policy "owner full access to wishlist_items" on wishlist_items
  for all using (is_trip_owner(trip_id)) with check (is_trip_owner(trip_id));
