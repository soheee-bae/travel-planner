export interface TripDay {
  dayIndex: number; // 1부터 시작
  date: string; // yyyy-mm-dd
}

/**
 * 여행 기간(시작~종료일)에서 Day 목록을 파생한다. 별도로 저장하지 않는다 —
 * 날짜가 바뀌면 그냥 다시 계산하면 되므로, "Day를 지우면 거기 있던 장소가
 * 고아가 되는" 문제 자체가 mock 단계에서는 생기지 않는다(docs/09 D8 참고,
 * 실제 배정은 Phase 5~6에서 place.dayIndex로 연결한다).
 */
export function getTripDays(startDate: string, endDate: string): TripDay[] {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  const days: TripDay[] = [];

  let cursor = start;
  let dayIndex = 1;
  while (cursor.getTime() <= end.getTime()) {
    days.push({ dayIndex, date: cursor.toISOString().slice(0, 10) });
    cursor = new Date(cursor.getTime() + 24 * 60 * 60 * 1000);
    dayIndex += 1;
  }
  return days;
}

/** 시작일 + 박수로 종료일을 계산한다 ("박수 ↔ 날짜 양방향 동기화"). */
export function endDateFromNights(startDate: string, nights: number): string {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(start.getTime() + nights * 24 * 60 * 60 * 1000);
  return end.toISOString().slice(0, 10);
}
