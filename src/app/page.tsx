import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4">
      <p className="text-sm text-muted-foreground">
        Phase 1 진행 중 — 앱 셸은 다음 커밋에서 채워집니다.
      </p>
      <Button>shadcn/ui 동작 확인</Button>
    </main>
  );
}
