import { z } from "zod";

export const checklistCategorySchema = z.object({
  id: z.string(),
  tripId: z.string(),
  name: z.string().min(1).max(40),
  icon: z.string(),
  orderIndex: z.number(),
});
export type ChecklistCategory = z.infer<typeof checklistCategorySchema>;
export const createChecklistCategoryInputSchema = checklistCategorySchema.omit({ id: true });
export type CreateChecklistCategoryInput = z.infer<typeof createChecklistCategoryInputSchema>;

export const checklistItemSchema = z.object({
  id: z.string(),
  categoryId: z.string(),
  tripId: z.string(),
  title: z.string().min(1).max(120),
  isChecked: z.boolean(),
  notes: z.string().optional(),
  orderIndex: z.number(),
});
export type ChecklistItem = z.infer<typeof checklistItemSchema>;
export const createChecklistItemInputSchema = checklistItemSchema.omit({ id: true });
export type CreateChecklistItemInput = z.infer<typeof createChecklistItemInputSchema>;
export const updateChecklistItemInputSchema = checklistItemSchema
  .omit({ id: true, categoryId: true, tripId: true })
  .partial();
export type UpdateChecklistItemInput = z.infer<typeof updateChecklistItemInputSchema>;

/**
 * 여행 생성 시 자동으로 채워지는 기본 카테고리 5종(docs 계획서 "기본
 * 카테고리 & 아이디어" 표). 사용자가 자유롭게 추가/삭제/이름변경할 수
 * 있으므로 이건 "제안 시드"일 뿐, 고정된 구조가 아니다.
 */
export const CHECKLIST_PRESET_CATEGORIES: {
  name: string;
  icon: string;
  items: string[];
}[] = [
  {
    name: "예약 관련",
    icon: "✈️",
    items: ["항공권 예약", "숙소 예약", "렌터카 예약", "투어/액티비티 예약"],
  },
  {
    name: "서류/필수",
    icon: "📄",
    items: ["여권 유효기간 확인", "여행자보험 가입", "비자 확인", "국제운전면허증"],
  },
  {
    name: "디지털",
    icon: "📱",
    items: ["포켓와이파이/유심 예약", "오프라인 지도 다운로드", "교통카드 충전"],
  },
  { name: "금융", icon: "💱", items: ["환전", "해외결제 카드 확인", "트래블월렛"] },
  {
    name: "패킹리스트",
    icon: "🧳",
    items: ["여권 + 사본", "충전기 / 보조배터리", "여행용 어댑터", "상비약", "세면도구"],
  },
];

/** "+ 기본 카테고리 추가하기" 버튼들 (P8-05). */
export const CHECKLIST_RECOMMENDED_CATEGORIES: { name: string; icon: string }[] = [
  { name: "쇼핑리스트", icon: "🛍️" },
  { name: "선물리스트", icon: "🎁" },
  { name: "음식 리스트", icon: "🍽️" },
  { name: "사고싶은것", icon: "💸" },
];

function buildSeed(tripId: string) {
  const categories: ChecklistCategory[] = [];
  const items: ChecklistItem[] = [];

  CHECKLIST_PRESET_CATEGORIES.forEach((preset, categoryIndex) => {
    const categoryId = `cat_${tripId}_${categoryIndex}`;
    categories.push({
      id: categoryId,
      tripId,
      name: preset.name,
      icon: preset.icon,
      orderIndex: categoryIndex,
    });
    preset.items.forEach((title, itemIndex) => {
      items.push({
        id: `item_${tripId}_${categoryIndex}_${itemIndex}`,
        categoryId,
        tripId,
        title,
        // 일부는 체크된 상태로 시드해 프로그레스 바가 0%가 아니게 한다.
        isChecked: categoryIndex === 0 && itemIndex < 2,
        orderIndex: itemIndex,
      });
    });
  });

  return { categories, items };
}

export const { categories: initialChecklistCategories, items: initialChecklistItems } =
  buildSeed("trip_nagoya");
