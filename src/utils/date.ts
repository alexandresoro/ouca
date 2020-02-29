import { utcToZonedTime } from "date-fns-tz";

export const interpretDateTimestampAsLocalTimeZoneDate = (
  dateString: string | Date
): Date => {
  if (!dateString) {
    return null;
  }
  return utcToZonedTime(new Date(dateString), "UTC");
};
