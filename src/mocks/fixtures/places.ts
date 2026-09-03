import { z } from "zod";

export const PLACE_CATEGORIES = ["관광", "맛집", "카페", "쇼핑", "액티비티", "기타"] as const;
export type PlaceCategory = (typeof PLACE_CATEGORIES)[number];

export const PLACE_PRIORITIES = ["필수", "가능하면", "시간되면"] as const;
export type PlacePriority = (typeof PLACE_PRIORITIES)[number];

/**
 * 계획서 v2의 장소 property 17개를 전부 담는다(docs/08 P5-01). dayIndex가
 * null이면 미배정 상태 — Phase 6(플래너)에서 Day에 배정하면 채워진다.
 * orderIndex는 같은 Day 안에서의 순서(소수, docs/09 D8 — 정수 순번은
 * 재정렬마다 여러 행을 다시 써야 해서 소수로 잡는다).
 */
export const placeSchema = z.object({
  id: z.string(),
  tripId: z.string(),
  name: z.string().min(1).max(120),
  category: z.enum(PLACE_CATEGORIES),
  address: z.string().optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  businessHours: z.string().optional(),
  closedDays: z.string().optional(),
  estimatedCost: z.number().nonnegative().optional(),
  costCurrency: z.string().optional(),
  durationMin: z.number().nonnegative().optional(),
  priority: z.enum(PLACE_PRIORITIES),
  dayIndex: z.number().int().positive().nullable(),
  orderIndex: z.number(),
  memo: z.string().optional(),
  linkUrl: z.string().optional(),
  photoUrl: z.string().optional(),
  tags: z.array(z.string()),
});
export type Place = z.infer<typeof placeSchema>;

export const createPlaceInputSchema = placeSchema.omit({ id: true });
export type CreatePlaceInput = z.infer<typeof createPlaceInputSchema>;

export const updatePlaceInputSchema = placeSchema.omit({ id: true, tripId: true }).partial();
export type UpdatePlaceInput = z.infer<typeof updatePlaceInputSchema>;

export const initialPlaces: Place[] = [
  {
    id: "place_nagoya_1",
    tripId: "trip_nagoya",
    name: "지브리 파크",
    category: "관광",
    address: "아이치현 나가쿠테시",
    lat: 35.204,
    lng: 137.058,
    businessHours: "10:00~17:00",
    closedDays: "화요일",
    estimatedCost: 3500,
    costCurrency: "JPY",
    durationMin: 240,
    priority: "필수",
    dayIndex: 2,
    orderIndex: 1,
    tags: ["지브리", "테마파크"],
  },
  {
    id: "place_nagoya_2",
    tripId: "trip_nagoya",
    name: "아츠타 호라이켄 마츠자카야점",
    category: "맛집",
    address: "나고야시 나카구",
    businessHours: "11:00~22:00",
    estimatedCost: 4600,
    costCurrency: "JPY",
    durationMin: 90,
    priority: "가능하면",
    dayIndex: 1,
    orderIndex: 1,
    memo: "히츠마부시, 대기표 먼저 받기",
    tags: ["히츠마부시"],
  },
  {
    id: "place_nagoya_3",
    tripId: "trip_nagoya",
    name: "코메다 커피 사카에 니시키 3초메점",
    category: "카페",
    businessHours: "07:00~20:00",
    estimatedCost: 800,
    costCurrency: "JPY",
    durationMin: 45,
    priority: "가능하면",
    dayIndex: 2,
    orderIndex: 0,
    tags: [],
  },
  {
    id: "place_nagoya_4",
    tripId: "trip_nagoya",
    name: "도요타 박물관",
    category: "관광",
    estimatedCost: 500,
    costCurrency: "JPY",
    durationMin: 120,
    priority: "시간되면",
    dayIndex: null,
    orderIndex: 0,
    tags: [],
  },
];
