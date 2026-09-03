import Link from "next/link";
import { ChevronLeft } from "lucide-react";

/** Phase 3에서 실제 생성 폼(여행지·박수·날짜·동행자·통화)으로 교체된다. */
export default function NewTripPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-6">
      <Link href="/trips" className="flex w-fit items-center gap-1 text-sm text-muted-foreground">
        <ChevronLeft className="size-4" aria-hidden="true" />
        여행 목록
      </Link>
      <p className="text-sm text-muted-foreground">여행 생성 폼은 Phase 3에서 만들어집니다.</p>
    </main>
  );
}
