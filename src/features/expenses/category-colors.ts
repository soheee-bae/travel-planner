import type { ExpenseCategory } from "@/mocks/fixtures/expenses";

/**
 * DESIGN.md 카테고리 팔레트(§색상 토큰)의 실측 hex를 그대로 재사용한다.
 * Recharts의 Pie `fill`은 CSS 커스텀 프로퍼티보다 리터럴 hex가 더 안전하다.
 */
export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  식비: "#5EC26A",
  숙소: "#0E7490",
  교통: "#4E81EE",
  "관광·입장": "#9D5AEF",
  쇼핑: "#C2568F",
  항공: "#1F4FC4",
  통신: "#6D727F",
  액티비티: "#DA9B35",
  기타: "#8A5A16",
};
