const toTimestamp = (
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number = 0,
): number => {
  return new Date(year, month - 1, day, hour, minute, second).getTime();
};

export { toTimestamp };
