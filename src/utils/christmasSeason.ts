// One scheduled season, midnight in Ireland. Both boundaries fall in GMT.
export const CHRISTMAS_START = Date.parse('2026-12-01T00:00:00+00:00');
export const CHRISTMAS_END = Date.parse('2027-01-07T00:00:00+00:00');

export function isChristmasSeason(now: Date = new Date()): boolean {
  const time = now.getTime();
  return time >= CHRISTMAS_START && time < CHRISTMAS_END;
}
