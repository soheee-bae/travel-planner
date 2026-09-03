"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useChecklistCategories,
  useChecklistItems,
  useCreateChecklistCategory,
} from "@/features/checklists/hooks";
import { ChecklistCategorySection } from "@/features/checklists/components/checklist-category";
import { CHECKLIST_RECOMMENDED_CATEGORIES } from "@/mocks/fixtures/checklists";

export function PrepTab({ tripId }: { tripId: string }) {
  const { data: categories, isLoading: loadingCategories } = useChecklistCategories(tripId);
  const { data: items, isLoading: loadingItems } = useChecklistItems(tripId);
  const createCategory = useCreateChecklistCategory(tripId);
  const [newCategoryName, setNewCategoryName] = useState("");

  const { checkedCount, totalCount, pct } = useMemo(() => {
    const total = items?.length ?? 0;
    const checked = items?.filter((i) => i.isChecked).length ?? 0;
    return {
      checkedCount: checked,
      totalCount: total,
      pct: total > 0 ? Math.round((checked / total) * 100) : 0,
    };
  }, [items]);

  function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    createCategory.mutate({
      tripId,
      name: newCategoryName.trim(),
      icon: "📌",
      orderIndex: categories?.length ?? 0,
    });
    setNewCategoryName("");
  }

  if (loadingCategories || loadingItems) {
    return <p className="p-6 text-sm text-muted-foreground">불러오는 중…</p>;
  }

  return (
    <div className="flex flex-col gap-5 p-4">
      <div>
        <p className="text-sm font-medium text-foreground">
          ✅ 여행 준비 ({checkedCount}/{totalCount} 완료)
        </p>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-[width]"
            style={{ width: `${pct}%` }}
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>

      {categories
        ?.sort((a, b) => a.orderIndex - b.orderIndex)
        .map((category) => (
          <ChecklistCategorySection
            key={category.id}
            tripId={tripId}
            category={category}
            items={(items ?? [])
              .filter((i) => i.categoryId === category.id)
              .sort((a, b) => a.orderIndex - b.orderIndex)}
          />
        ))}

      <form onSubmit={handleAddCategory} className="flex gap-2">
        <Input
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          placeholder="새 카테고리 이름"
          aria-label="새 카테고리 이름"
          className="h-9"
        />
        <Button type="submit" size="sm" className="gap-1">
          <Plus className="size-4" aria-hidden="true" />
          추가
        </Button>
      </form>

      <div className="flex flex-col gap-2">
        <p className="text-xs text-muted-foreground">💡 기본 카테고리 추가하기</p>
        <div className="flex flex-wrap gap-2">
          {CHECKLIST_RECOMMENDED_CATEGORIES.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() =>
                createCategory.mutate({
                  tripId,
                  name: preset.name,
                  icon: preset.icon,
                  orderIndex: categories?.length ?? 0,
                })
              }
              className="rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground"
            >
              {preset.icon} {preset.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
