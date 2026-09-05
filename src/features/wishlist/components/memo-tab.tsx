"use client";

import { useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  useCreateWishlistItem,
  useDeleteWishlistItem,
  useUpdateWishlistItem,
  useWishlist,
} from "@/features/wishlist/hooks";
import { WishlistItemDialog } from "@/features/wishlist/components/wishlist-item-dialog";
import type { WishlistItem } from "@/mocks/fixtures/wishlist";

function computeNewOrderIndex(items: WishlistItem[], newIndex: number): number {
  const prev = items[newIndex - 1];
  const next = items[newIndex + 1];
  if (prev && next) return (prev.orderIndex + next.orderIndex) / 2;
  if (prev) return prev.orderIndex + 1;
  if (next) return next.orderIndex - 1;
  return 0;
}

function SortableWishlistCard({
  item,
  onEdit,
  onDelete,
}: {
  item: WishlistItem;
  onEdit: (values: { icon: string; title: string; content?: string }) => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex flex-col gap-1 rounded-lg border border-border bg-card p-3",
        isDragging && "opacity-90 shadow-lg",
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">
          {item.icon} {item.title}
        </p>
        <div className="flex items-center gap-1">
          <WishlistItemDialog
            initial={item}
            onSubmit={onEdit}
            trigger={
              <Button size="sm" variant="ghost">
                편집
              </Button>
            }
          />
          <Button size="sm" variant="ghost" onClick={onDelete} aria-label={`${item.title} 삭제`}>
            삭제
          </Button>
          <button
            {...attributes}
            {...listeners}
            aria-label={`${item.title} 순서 변경 (드래그)`}
            className="touch-callout-none flex size-8 shrink-0 items-center justify-center text-muted-foreground"
          >
            <GripVertical className="size-4" />
          </button>
        </div>
      </div>
      {item.content && (
        <p className="whitespace-pre-line text-sm text-muted-foreground">{item.content}</p>
      )}
    </div>
  );
}

export function MemoTab({ tripId }: { tripId: string }) {
  const { data, isLoading, isError } = useWishlist(tripId);
  const [items, setItems] = useState<WishlistItem[]>([]);
  const createItem = useCreateWishlistItem(tripId);
  const updateItem = useUpdateWishlistItem(tripId);
  const deleteItem = useDeleteWishlistItem(tripId);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const sorted = (data ?? []).slice().sort((a, b) => a.orderIndex - b.orderIndex);
  // id·순서뿐 아니라 내용(제목·아이콘 등 편집)이 바뀌어도 다시 동기화해야
  // 한다 — id/length만 비교하면 편집 후 화면이 낡은 스냅샷에 멈춰 있는다.
  if (JSON.stringify(items) !== JSON.stringify(sorted)) {
    setItems(sorted);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex);
    setItems(reordered);

    const newOrderIndex = computeNewOrderIndex(reordered, newIndex);
    updateItem.mutate({ id: active.id as string, patch: { orderIndex: newOrderIndex } });
  }

  if (isLoading) return <p className="p-6 text-sm text-muted-foreground">불러오는 중…</p>;
  if (isError) return <p className="p-6 text-sm text-destructive">메모를 불러오지 못했습니다.</p>;

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">📝 위시리스트 & 메모</p>
        <WishlistItemDialog
          onSubmit={(values) => createItem.mutate({ tripId, orderIndex: items.length, ...values })}
          trigger={
            <Button size="sm" className="gap-1">
              <Plus className="size-4" aria-hidden="true" />새 메모 추가
            </Button>
          }
        />
      </div>

      {items.length === 0 && (
        <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          자유롭게 아이디어나 링크를 메모해 두세요
        </p>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2">
            {items.map((item) => (
              <SortableWishlistCard
                key={item.id}
                item={item}
                onEdit={(values) => updateItem.mutate({ id: item.id, patch: values })}
                onDelete={() => deleteItem.mutate(item.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
