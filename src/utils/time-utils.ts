export const parseISO8601AsUTCDate = (date: string): Date => {
  return new Date(Date.parse(date));
};
