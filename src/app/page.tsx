import { redirect } from "next/navigation";

/**
 * 스플래시는 라우트가 아니라 오버레이다 (docs/09 D9). "/"는 랜딩(/trips)으로
 * 즉시 보낸다 — 뒤로가기가 빈 스플래시 화면으로 돌아가는 것을 막는다.
 */
export default function RootPage() {
  redirect("/trips");
}
