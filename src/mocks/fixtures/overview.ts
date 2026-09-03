import { z } from "zod";

export const accommodationSchema = z.object({
  id: z.string(),
  tripId: z.string(),
  name: z.string().min(1),
  checkinDate: z.string(),
  checkoutDate: z.string(),
  checkinTime: z.string().optional(),
  checkoutTime: z.string().optional(),
  address: z.string().optional(),
  bookingRef: z.string().optional(),
  cost: z.number().nonnegative().optional(),
  memo: z.string().optional(),
});
export type Accommodation = z.infer<typeof accommodationSchema>;
export const createAccommodationInputSchema = accommodationSchema.omit({ id: true });
export type CreateAccommodationInput = z.infer<typeof createAccommodationInputSchema>;

export const TRANSPORT_TYPES = ["비행기", "KTX", "버스", "렌터카", "페리"] as const;
export const transportSchema = z.object({
  id: z.string(),
  tripId: z.string(),
  type: z.enum(TRANSPORT_TYPES),
  departureFrom: z.string().min(1),
  arrivalTo: z.string().min(1),
  departureAt: z.string(), // ISO datetime
  arrivalAt: z.string(),
  bookingRef: z.string().optional(),
  cost: z.number().nonnegative().optional(),
  memo: z.string().optional(),
});
export type Transport = z.infer<typeof transportSchema>;
export const createTransportInputSchema = transportSchema.omit({ id: true });
export type CreateTransportInput = z.infer<typeof createTransportInputSchema>;

export const initialAccommodations: Accommodation[] = [
  {
    id: "acc_nagoya_1",
    tripId: "trip_nagoya",
    name: "호텔 악텔 나고야 니시키",
    checkinDate: "2026-11-06",
    checkoutDate: "2026-11-08",
    checkinTime: "15:00",
    checkoutTime: "11:00",
    address: "나고야시 나카구 니시키",
    cost: 180000,
  },
];

export const initialTransports: Transport[] = [
  {
    id: "tr_nagoya_1",
    tripId: "trip_nagoya",
    type: "비행기",
    departureFrom: "인천",
    arrivalTo: "나고야(센트레아)",
    departureAt: "2026-11-06T09:00",
    arrivalAt: "2026-11-06T11:20",
    bookingRef: "7C1234",
    cost: 350000,
  },
  {
    id: "tr_nagoya_2",
    tripId: "trip_nagoya",
    type: "비행기",
    departureFrom: "나고야(센트레아)",
    arrivalTo: "인천",
    departureAt: "2026-11-08T19:00",
    arrivalAt: "2026-11-08T21:10",
    bookingRef: "7C1235",
    cost: 350000,
  },
];
