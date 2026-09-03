"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { CATEGORY_COLORS } from "@/features/expenses/category-colors";
import type { CategoryShare } from "@/lib/expense-aggregation";

/**
 * 슬라이스끼리 색 대비가 낮아(관광 보라 vs 쇼핑 핑크 등) 색만으로 구분하기
 * 어렵다(docs/04 §4.2). 흰 stroke로 슬라이스를 나누고, 차트 옆에 직접
 * 라벨+퍼센트 목록을 같이 보여준다 — hover 툴팁에만 의존하지 않는다.
 */
export function BudgetDonutChart({ data }: { data: CategoryShare[] }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="h-48 w-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="total"
              nameKey="category"
              innerRadius={50}
              outerRadius={80}
              stroke="var(--card)"
              strokeWidth={2}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.category}
                  fill={CATEGORY_COLORS[entry.category as keyof typeof CATEGORY_COLORS]}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="grid w-full grid-cols-2 gap-x-4 gap-y-1.5" aria-label="카테고리별 비율">
        {data.map((entry) => (
          <li key={entry.category} className="flex items-center gap-1.5 text-xs">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{
                backgroundColor: CATEGORY_COLORS[entry.category as keyof typeof CATEGORY_COLORS],
              }}
              aria-hidden="true"
            />
            <span className="text-foreground">{entry.category}</span>
            <span className="text-muted-foreground">{entry.pct}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
