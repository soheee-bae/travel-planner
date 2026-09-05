/** ISO 날짜(yyyy-mm-dd) 두 개로 몇 박 며칠을 계산한다. */
export function calcNights(startDate: string, endDate: string): number {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  const diffMs = end.getTime() - start.getTime();
  return Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));
}

/** "2박 3일" 형태. 당일치기(0박)는 "1일"로 표기한다. */
export function formatDuration(startDate: string, endDate: string): string {
  const nights = calcNights(startDate, endDate);
  if (nights === 0) return "1일";
  return `${nights}박 ${nights + 1}일`;
}

/** "9/15~9/17" 형태. */
export function formatDateRange(startDate: string, endDate: string): string {
  const fmt = (iso: string) => {
    const [, m, d] = iso.split("-");
    return `${Number(m)}/${Number(d)}`;
  };
  return `${fmt(startDate)}~${fmt(endDate)}`;
}
