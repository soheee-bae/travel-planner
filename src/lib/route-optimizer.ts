import { haversineDistanceMeters } from "@/lib/geo";

export interface RoutePoint {
  id: string;
  lat: number;
  lng: number;
}

const EXACT_SOLVER_LIMIT = 12; // 2^12 * 12^2 ≈ 59만 — 수십 ms 내로 끝난다

function buildDistanceMatrix(points: RoutePoint[]): number[][] {
  return points.map((a) => points.map((b) => haversineDistanceMeters(a, b)));
}

/** Held-Karp 비트마스크 DP. 시작점(index 0)에서 출발해 전부 방문하는 최소 경로. */
function heldKarp(dist: number[][]): number[] {
  const n = dist.length;
  const FULL = 1 << n;
  // dp[mask][i] = mask에 포함된 점들을 방문하고 i에서 끝나는 최소 비용
  const dp: number[][] = Array.from({ length: FULL }, () => Array(n).fill(Infinity));
  const parent: number[][] = Array.from({ length: FULL }, () => Array(n).fill(-1));

  dp[1][0] = 0;

  for (let mask = 1; mask < FULL; mask++) {
    if (!(mask & 1)) continue; // 항상 시작점(0)을 포함한 마스크만 본다
    for (let i = 0; i < n; i++) {
      if (!(mask & (1 << i)) || dp[mask][i] === Infinity) continue;
      for (let j = 0; j < n; j++) {
        if (mask & (1 << j)) continue;
        const nextMask = mask | (1 << j);
        const candidate = dp[mask][i] + dist[i][j];
        if (candidate < dp[nextMask][j]) {
          dp[nextMask][j] = candidate;
          parent[nextMask][j] = i;
        }
      }
    }
  }

  const fullMask = FULL - 1;
  let last = 0;
  let best = Infinity;
  for (let i = 1; i < n; i++) {
    if (dp[fullMask][i] < best) {
      best = dp[fullMask][i];
      last = i;
    }
  }

  const order: number[] = [];
  let mask = fullMask;
  let cur = last;
  while (cur !== -1) {
    order.push(cur);
    const prev = parent[mask][cur];
    mask ^= 1 << cur;
    cur = prev;
  }
  return order.reverse();
}

function nearestNeighbor(dist: number[][]): number[] {
  const n = dist.length;
  const visited = new Set<number>([0]);
  const order = [0];
  while (order.length < n) {
    const last = order[order.length - 1];
    let next = -1;
    let best = Infinity;
    for (let j = 0; j < n; j++) {
      if (visited.has(j)) continue;
      if (dist[last][j] < best) {
        best = dist[last][j];
        next = j;
      }
    }
    order.push(next);
    visited.add(next);
  }
  return order;
}

function totalDistance(order: number[], dist: number[][]): number {
  let sum = 0;
  for (let i = 0; i < order.length - 1; i++) sum += dist[order[i]][order[i + 1]];
  return sum;
}

function twoOpt(order: number[], dist: number[][]): number[] {
  let improved = true;
  let best = [...order];
  while (improved) {
    improved = false;
    for (let i = 1; i < best.length - 2; i++) {
      for (let j = i + 1; j < best.length - 1; j++) {
        const candidate = [
          ...best.slice(0, i),
          ...best.slice(i, j + 1).reverse(),
          ...best.slice(j + 1),
        ];
        if (totalDistance(candidate, dist) < totalDistance(best, dist)) {
          best = candidate;
          improved = true;
        }
      }
    }
  }
  return best;
}

/**
 * 시작점(첫 번째 항목, 보통 숙소)에서 출발해 전부 방문하는 순서를
 * 근사 최적화한다. n≤12는 Held-Karp로 정확해를 구하고, 그 이상은
 * Nearest Neighbor + 2-opt로 개선한다(docs/06 §6.4).
 */
export function optimizeRouteOrder(points: RoutePoint[]): RoutePoint[] {
  if (points.length <= 2) return points;

  const dist = buildDistanceMatrix(points);
  const order =
    points.length <= EXACT_SOLVER_LIMIT ? heldKarp(dist) : twoOpt(nearestNeighbor(dist), dist);

  return order.map((i) => points[i]);
}
