const toTimestamp = (
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
): number => {
  return new Date(year, month - 1, day, hour, minute).getTime();
};

export { toTimestamp };
