import { z } from "zod";

export const wishlistItemSchema = z.object({
  id: z.string(),
  tripId: z.string(),
  icon: z.string(),
  title: z.string().min(1).max(60),
  content: z.string().optional(),
  orderIndex: z.number(),
});
export type WishlistItem = z.infer<typeof wishlistItemSchema>;

export const createWishlistItemInputSchema = wishlistItemSchema.omit({ id: true });
export type CreateWishlistItemInput = z.infer<typeof createWishlistItemInputSchema>;

export const updateWishlistItemInputSchema = wishlistItemSchema
  .omit({ id: true, tripId: true })
  .partial();
export type UpdateWishlistItemInput = z.infer<typeof updateWishlistItemInputSchema>;

export const initialWishlistItems: WishlistItem[] = [
  {
    id: "wish_nagoya_1",
    tripId: "trip_nagoya",
    icon: "🍜",
    title: "현지인 추천 맛집들",
    content: "- 인스타에서 본 그 라멘집\n- 호텔 근처 이자카야",
    orderIndex: 0,
  },
  {
    id: "wish_nagoya_2",
    tripId: "trip_nagoya",
    icon: "📸",
    title: "포토스팟",
    content: "- 일몰 시간 확인하기\n- 나고야성 야경",
    orderIndex: 1,
  },
  {
    id: "wish_nagoya_3",
    tripId: "trip_nagoya",
    icon: "🛒",
    title: "쇼핑 메모",
    content: "- 돈키호테 쿠폰 다운받기",
    orderIndex: 2,
  },
];
