create view trip_totals with (security_invoker = on) as
select trip_id, sum(amount) as total
from expenses
group by trip_id;

create view trip_cost_by_category with (security_invoker = on) as
select
  trip_id,
  category,
  sum(amount) as total,
  round(
    100.0 * sum(amount) / nullif(sum(sum(amount)) over (partition by trip_id), 0)
  )::int as pct
from expenses
group by trip_id, category;

create view trip_cost_by_day with (security_invoker = on) as
select trip_id, day_index, sum(amount) as total
from expenses
group by trip_id, day_index;
