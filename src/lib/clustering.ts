import { projectForClustering } from "@/lib/geo";

export interface ClusterableItem {
  id: string;
  lat: number;
  lng: number;
}

/**
 * 위치 기반 k-means. k = 여행 일수로 두고 미배정 장소를 날짜별로
 * 자동 제안한다(docs/06 §6.4 "자동 배치"). 경도는 중심 위도로 cos 보정한
 * 좌표계에서 계산한다 — 보정 없이 하면 동서 방향으로 부당하게 뭉친다.
 *
 * 결과는 제안일 뿐이다. 호출한 쪽에서 그대로 적용하지 않고 미리보기 후
 * 사용자가 수락해야 한다(자동 확정 금지 — docs/06 §6.4).
 */
export function kMeansCluster<T extends ClusterableItem>(
  items: T[],
  k: number,
  maxIterations = 50,
): Map<string, number> {
  const assignment = new Map<string, number>();
  if (items.length === 0 || k <= 0) return assignment;

  const centerLat = items.reduce((sum, p) => sum + p.lat, 0) / items.length;
  const projected = items.map((item) => ({
    id: item.id,
    ...projectForClustering(item, centerLat),
  }));

  const effectiveK = Math.min(k, items.length);
  // 초기 centroid: 데이터를 고르게 훑어 뽑는다(무작위보다 안정적인 결과).
  let centroids = Array.from({ length: effectiveK }, (_, i) => {
    const idx = Math.floor((i * projected.length) / effectiveK);
    return { x: projected[idx].x, y: projected[idx].y };
  });

  for (let iter = 0; iter < maxIterations; iter++) {
    let changed = false;

    for (const point of projected) {
      let bestCluster = 0;
      let bestDist = Infinity;
      centroids.forEach((centroid, ci) => {
        const dist = (point.x - centroid.x) ** 2 + (point.y - centroid.y) ** 2;
        if (dist < bestDist) {
          bestDist = dist;
          bestCluster = ci;
        }
      });
      if (assignment.get(point.id) !== bestCluster) changed = true;
      assignment.set(point.id, bestCluster);
    }

    const nextCentroids = centroids.map((_, ci) => {
      const members = projected.filter((p) => assignment.get(p.id) === ci);
      if (members.length === 0) return centroids[ci];
      return {
        x: members.reduce((sum, m) => sum + m.x, 0) / members.length,
        y: members.reduce((sum, m) => sum + m.y, 0) / members.length,
      };
    });
    centroids = nextCentroids;

    if (!changed) break;
  }

  return assignment;
}
