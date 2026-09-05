"use client";

import { useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
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
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { estimateWalkMinutes } from "@/lib/geo";
import { useUpdatePlace } from "@/features/places/hooks";
import type { Place } from "@/mocks/fixtures/places";

const CATEGORY_ICON: Record<Place["category"], string> = {
  관광: "🏛️",
  맛집: "🍽️",
  카페: "☕",
  쇼핑: "🛍️",
  액티비티: "🎢",
  기타: "📍",
};

function SortableItem({ place, index }: { place: Place; index: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: place.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex items-center gap-2 rounded-lg border border-border bg-card p-3",
        isDragging && "shadow-lg opacity-90",
      )}
    >
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
        {index + 1}
      </span>
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">
          {CATEGORY_ICON[place.category]} {place.name}
        </p>
        {place.estimatedCost != null && (
          <p className="text-xs text-money">
            {place.costCurrency} {place.estimatedCost.toLocaleString()}
          </p>
        )}
      </div>
      <button
        {...attributes}
        {...listeners}
        aria-label={`${place.name} 순서 변경 (드래그)`}
        className="touch-callout-none flex size-8 shrink-0 items-center justify-center text-muted-foreground"
      >
        <GripVertical className="size-4" />
      </button>
    </div>
  );
}

/**
 * DnD로 순서를 바꾸면 fractional index로 그 항목 하나만 갱신한다
 * (docs/09 D8) — 전체 리스트를 다시 쓰지 않는다.
 */
function computeNewOrderIndex(items: Place[], newIndex: number): number {
  const prev = items[newIndex - 1];
  const next = items[newIndex + 1];
  if (prev && next) return (prev.orderIndex + next.orderIndex) / 2;
  if (prev) return prev.orderIndex + 1;
  if (next) return next.orderIndex - 1;
  return 0;
}

export function DayItineraryList({ tripId, places }: { tripId: string; places: Place[] }) {
  const [items, setItems] = useState(places);
  const updatePlace = useUpdatePlace(tripId);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // 부모(usePlaces) 데이터가 바뀌면(다른 곳에서 갱신 등) 동기화한다.
  // id·길이뿐 아니라 내용(카테고리·비용 등 편집)도 비교해야 한다 —
  // id/length만 보면 편집 후 화면이 낡은 스냅샷에 멈춰 있는 버그가 있었다
  // (features/wishlist/components/memo-tab.tsx에서 같은 패턴으로 발견).
  if (JSON.stringify(items) !== JSON.stringify(places)) {
    setItems(places);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((p) => p.id === active.id);
    const newIndex = items.findIndex((p) => p.id === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex);
    setItems(reordered);

    const newOrderIndex = computeNewOrderIndex(reordered, newIndex);
    updatePlace.mutate({ id: active.id as string, patch: { orderIndex: newOrderIndex } });
  }

  if (items.length === 0) {
    return (
      <p className="p-4 text-center text-sm text-muted-foreground">
        아직 일정이 없어요. 리스트 탭에서 후보를 가져오세요.
      </p>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((p) => p.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2 py-2">
          {items.map((place, index) => {
            const next = items[index + 1];
            const canEstimateWalk =
              next &&
              place.lat != null &&
              place.lng != null &&
              next.lat != null &&
              next.lng != null;

            return (
              <div key={place.id}>
                <SortableItem place={place} index={index} />
                {canEstimateWalk && (
                  <p className="py-1 text-center text-xs text-muted-foreground">
                    🚶 ~
                    {estimateWalkMinutes(
                      { lat: place.lat!, lng: place.lng! },
                      { lat: next.lat!, lng: next.lng! },
                    )}
                    분
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
}
