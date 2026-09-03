"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { usePlaces, useDeletePlace } from "@/features/places/hooks";
import { PlaceCard } from "@/features/places/components/place-card";
import { PlaceFilterBar, type PlaceFilter } from "@/features/places/components/place-filter-bar";
import { AddPlaceDialog } from "@/features/places/components/add-place-dialog";

export function PlacesTab({ tripId }: { tripId: string }) {
  const { data: places, isLoading, isError } = usePlaces(tripId);
  const deletePlace = useDeletePlace(tripId);
  const [filter, setFilter] = useState<PlaceFilter>("전체");
  const [selectionMode, setSelectionMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const counts = useMemo(() => {
    const base: Record<PlaceFilter, number> = {
      전체: places?.length ?? 0,
      관광: 0,
      맛집: 0,
      카페: 0,
      쇼핑: 0,
      액티비티: 0,
      기타: 0,
    };
    for (const p of places ?? []) base[p.category] += 1;
    return base;
  }, [places]);

  const filtered = useMemo(() => {
    if (!places) return [];
    return filter === "전체" ? places : places.filter((p) => p.category === filter);
  }, [places, filter]);

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function exitSelectionMode() {
    setSelectionMode(false);
    setSelected(new Set());
  }

  function handleBulkDelete() {
    selected.forEach((id) => deletePlace.mutate(id));
    exitSelectionMode();
  }

  if (isLoading) return <p className="p-6 text-sm text-muted-foreground">불러오는 중…</p>;
  if (isError)
    return <p className="p-6 text-sm text-destructive">장소 목록을 불러오지 못했습니다.</p>;

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <PlaceFilterBar active={filter} onChange={setFilter} counts={counts} />
      </div>

      <div className="flex items-center justify-between">
        {selectionMode ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground" aria-live="polite">
            {selected.size}개 선택됨
          </div>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          {selectionMode ? (
            <>
              <Button size="sm" variant="ghost" onClick={exitSelectionMode}>
                취소
              </Button>
              <Button
                size="sm"
                variant="destructive"
                disabled={selected.size === 0}
                onClick={handleBulkDelete}
              >
                삭제
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="outline" onClick={() => setSelectionMode(true)}>
                선택
              </Button>
              <AddPlaceDialog tripId={tripId} />
            </>
          )}
        </div>
      </div>

      {filtered.length === 0 && (
        <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          가고 싶은 곳을 모아두면 여기에 쌓여요
        </p>
      )}

      <div className="flex flex-col gap-2">
        {filtered.map((place) => (
          <PlaceCard
            key={place.id}
            place={place}
            selectionMode={selectionMode}
            selected={selected.has(place.id)}
            onToggleSelect={() => toggleSelect(place.id)}
            onDelete={() => deletePlace.mutate(place.id)}
          />
        ))}
      </div>
    </div>
  );
}
