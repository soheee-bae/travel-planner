/**
 * crypto.randomUUID()의 안전한 래퍼. 오래된 Safari/HTTP(비-secure context)
 * 환경에서 randomUUID가 없을 때를 위한 폴백.
 */
export function randomUUID(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
