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
  },
];
