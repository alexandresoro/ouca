// eslint-disable-next-line import/no-duplicates
import { parse } from "date-fns";
// eslint-disable-next-line import/no-duplicates
import { fr as locale } from "date-fns/locale";

export const areSetsContainingSameValues = <T>(firstArray: Set<T>, secondArray: Set<T>): boolean => {
  if (firstArray.size !== secondArray.size) return false;
  return [...firstArray].every((value) => secondArray.has(value));
};

export const isIdInListIds = <T>(ids: Set<T>, idToFind: T): boolean => {
  return !![...ids].find((id) => {
    return id === idToFind;
  });
};

export const getFormattedDate = (value: string): Date | null => {
  const dateFormat = "dd/MM/yyyy";

  const parsedDate = parse(value, dateFormat, new Date(), {
    locale,
  });

  // As date-fns parsing is not exact and could provide surprises, we check that we indeed parsed a proper year
  if (parsedDate.getFullYear() < 1000) {
    return null;
  }

  // Invalid date is represented by NaN which is not === to itself
  // rome-ignore lint/suspicious/noSelfCompare: <explanation>
  if (parsedDate.getTime() === parsedDate.getTime()) {
    return parsedDate;
  }

  return null;
};

/**
 * @deprecated use getMinutesFromTime + getHumanFriendlyTimeFromMinutes instead
 */
export const getFormattedTime = (timeStr: string): string | null => {
  const timeRegExpExpected = new RegExp("^[0-9][0-9]:[0-5][0-9]$");
  if (timeRegExpExpected.test(timeStr)) {
    return timeStr;
  }

  const timeRegExp1 = new RegExp("^[0-9][0-9][0-5][0-9]$");
  if (timeRegExp1.test(timeStr)) {
    return `${timeStr.charAt(0)}${timeStr.charAt(1)}:${timeStr.charAt(2)}${timeStr.charAt(3)}`;
  }

  const timeRegExp2 = new RegExp("^[0-9][0-9][h][0-5][0-9]$");
  if (timeRegExp2.test(timeStr)) {
    return timeStr.replace("h", ":");
  }

  const timeRegExp3 = new RegExp("^[0-9][0-9][H][0-5][0-9]$");
  if (timeRegExp3.test(timeStr)) {
    return timeStr.replace("H", ":");
  }

  return null;
};

/**
 * @deprecated use validTimeSchema instead
 */
export const isTimeValid = (timeStr: string): boolean => {
  const value = getFormattedTime(timeStr);

  const timeRegExp = new RegExp("^[0-9][0-9][:][0-5][0-9]$");
  return !!value && timeRegExp.test(value);
};
