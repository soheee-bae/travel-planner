"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useCreateChecklistItem,
  useDeleteChecklistCategory,
  useDeleteChecklistItem,
  useUpdateChecklistItem,
} from "@/features/checklists/hooks";
import type { ChecklistCategory, ChecklistItem } from "@/mocks/fixtures/checklists";

export function ChecklistCategorySection({
  tripId,
  category,
  items,
}: {
  tripId: string;
  category: ChecklistCategory;
  items: ChecklistItem[];
}) {
  const [newItemTitle, setNewItemTitle] = useState("");
  const createItem = useCreateChecklistItem(tripId);
  const updateItem = useUpdateChecklistItem(tripId);
  const deleteItem = useDeleteChecklistItem(tripId);
  const deleteCategory = useDeleteChecklistCategory(tripId);

  function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    if (!newItemTitle.trim()) return;
    createItem.mutate({
      tripId,
      categoryId: category.id,
      title: newItemTitle.trim(),
      isChecked: false,
      orderIndex: items.length,
    });
    setNewItemTitle("");
  }

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">
          {category.icon} {category.name}
        </h2>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => deleteCategory.mutate(category.id)}
          aria-label={`${category.name} 카테고리 삭제`}
        >
          <Trash2 className="size-4" aria-hidden="true" />
        </Button>
      </div>

      <div className="flex flex-col gap-1">
        {items.map((item) => (
          <label
            key={item.id}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
          >
            <input
              type="checkbox"
              checked={item.isChecked}
              onChange={(e) =>
                updateItem.mutate({ id: item.id, patch: { isChecked: e.target.checked } })
              }
              className="size-4"
            />
            <span
              className={
                item.isChecked
                  ? "flex-1 text-muted-foreground line-through"
                  : "flex-1 text-foreground"
              }
            >
              {item.title}
            </span>
            <button
              type="button"
              onClick={() => deleteItem.mutate(item.id)}
              aria-label={`${item.title} 삭제`}
              className="text-muted-foreground"
            >
              ×
            </button>
          </label>
        ))}
      </div>

      <form onSubmit={handleAddItem} className="flex gap-2">
        <Input
          value={newItemTitle}
          onChange={(e) => setNewItemTitle(e.target.value)}
          placeholder="항목 추가"
          aria-label={`${category.name}에 항목 추가`}
          className="h-8"
        />
        <Button type="submit" size="sm" variant="outline" aria-label="추가">
          <Plus className="size-4" aria-hidden="true" />
        </Button>
      </form>
    </section>
  );
}
