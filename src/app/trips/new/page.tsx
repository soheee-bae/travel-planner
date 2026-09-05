import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { CreateTripForm } from "@/features/trips/components/create-trip-form";

export default function NewTripPage() {
  return (
    <main className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
      <Link href="/trips" className="flex w-fit items-center gap-1 text-sm text-muted-foreground">
        <ChevronLeft className="size-4" aria-hidden="true" />
        여행 목록
      </Link>
      <h1 className="font-serif text-2xl font-semibold text-foreground">여행 만들기</h1>
      <CreateTripForm />
    </main>
  );
}
