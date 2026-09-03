import { Button } from "@/components/ui/button";

// Tailwind는 클래스명을 정적으로 스캔하므로 템플릿 문자열로 조합하지 않고
// 전체 클래스명을 리터럴로 나열한다.
const categories = [
  { label: "관광", className: "bg-category-sight-bg text-category-sight-fg" },
  { label: "교통", className: "bg-category-transport-bg text-category-transport-fg" },
  { label: "식사", className: "bg-category-food-bg text-category-food-fg" },
  { label: "이동", className: "bg-category-move-bg text-category-move-fg" },
  { label: "쇼핑", className: "bg-category-shop-bg text-category-shop-fg" },
  { label: "카페", className: "bg-category-cafe-bg text-category-cafe-fg" },
  { label: "숙소", className: "bg-category-stay-bg text-category-stay-fg" },
] as const;

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-6 p-6">
      <h1 className="font-serif text-2xl font-semibold text-foreground">
        여행 플래너
      </h1>
      <p className="text-sm text-muted-foreground">
        Phase 1 진행 중 — 앱 셸은 다음 커밋에서 채워집니다. (P1-03 토큰 확인용 임시 화면)
      </p>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">전체 총 비용</span>
          <span className="text-lg font-bold text-money">₩286,000</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <span
            key={c.label}
            className={`rounded-md px-2.5 py-1 text-xs font-semibold ${c.className}`}
          >
            {c.label}
          </span>
        ))}
      </div>

      <div className="flex gap-2">
        <Button>기본 버튼</Button>
        <Button variant="outline">아웃라인</Button>
        <Button variant="destructive">삭제</Button>
      </div>
    </main>
  );
}
