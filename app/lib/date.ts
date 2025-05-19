export function isPast(date: string) {
  return new Date(date) < new Date();
}
