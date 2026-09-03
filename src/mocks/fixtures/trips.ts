import { z } from "zod";

export const tripSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(120),
  destinationCountry: z.string(),
  destinationCity: z.string(),
  startDate: z.string(), // ISO date (yyyy-mm-dd)
  endDate: z.string(),
  companions: z.string(),
  coverEmoji: z.string(),
  baseCurrency: z.enum(["KRW", "JPY", "USD", "EUR"]),
});

export type Trip = z.infer<typeof tripSchema>;

export const createTripInputSchema = tripSchema.omit({ id: true });
export type CreateTripInput = z.infer<typeof createTripInputSchema>;

export const initialTrips: Trip[] = [
  {
    id: "trip_jeju",
    title: "제주도 여행",
    destinationCountry: "KR",
    destinationCity: "제주도",
    startDate: "2026-09-15",
    endDate: "2026-09-17",
    companions: "친구들과",
    coverEmoji: "🇰🇷",
    baseCurrency: "KRW",
  },
  {
    id: "trip_osaka",
    title: "오사카 여행",
    destinationCountry: "JP",
    destinationCity: "오사카",
    startDate: "2026-10-01",
    endDate: "2026-10-04",
    companions: "커플",
    coverEmoji: "🇯🇵",
    baseCurrency: "JPY",
  },
  {
    // 첨부 스크린샷(나고야 3일 일정)을 재현하기 위한 시드. Phase 4~6의 실제
    // 일정/지도/비용 뷰 검증에서 이 여행의 일차별 데이터를 채워나간다.
    id: "trip_nagoya",
    title: "나고야 여행 플래너",
    destinationCountry: "JP",
    destinationCity: "나고야",
    startDate: "2026-11-06",
    endDate: "2026-11-08",
    companions: "혼자",
    coverEmoji: "🏯",
    baseCurrency: "JPY",
  },
];
