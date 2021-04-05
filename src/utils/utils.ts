import { parse } from "date-fns";
import { fr as locale } from "date-fns/locale";
import { EntiteSimple } from "../model/types/entite-simple.object";
import { NumberOfObjectsById } from "../objects/number-of-objects-by-id.object";

export const toCamel = (s: string): string => {
  return s.replace(/([-_][a-z])/gi, ($1) => {
    return $1.toUpperCase().replace("-", "").replace("_", "");
  });
};

export const areArraysContainingSameValues = <T>(
  firstArray: T[],
  secondArray: T[]
): boolean => {
  if (firstArray.length !== secondArray.length) return false;
  const allUniqueValues = new Set([...firstArray, ...secondArray]);
  for (const value of allUniqueValues) {
    const firstArrayCount = firstArray.filter(e => e === value).length;
    const secondArrayCount = secondArray.filter(e => e === value).length;
    if (firstArrayCount !== secondArrayCount) return false;
  }
  return true;
};

export const getArrayFromObjects = <T, U>(
  objects: T[],
  attributeName: string
): U[] => {
  return objects.map((object) => {
    return object[attributeName] as U;
  });
};

export const isIdInListIds = (ids: number[], idToFind: number): boolean => {
  return !!ids.find((id) => {
    return id === idToFind;
  });
};

export const getFormattedDate = (value: string): Date | null => {
  const dateFormat = "dd/MM/yyyy";

  const parsedDate = parse(value, dateFormat, new Date(), {
    locale
  });

  // Invalid date is represented by NaN which is not === to itself
  if (parsedDate.getTime() === parsedDate.getTime()) {
    return parsedDate;
  }

  return null;
};

export const getFormattedTime = (timeStr: string): string => {
  if (timeStr) {
    let value = timeStr;
    const timeRegExp1 = new RegExp("^[0-9][0-9][0-9][0-9]$");
    if (timeRegExp1.test(value)) {
      value =
        value.charAt(0) +
        value.charAt(1) +
        ":" +
        value.charAt(2) +
        value.charAt(3);
    }

    const timeRegExp2 = new RegExp("^[0-9][0-9][h][0-9][0-9]$");
    if (timeRegExp2.test(value)) {
      value = value.replace("h", ":");
    }

    const timeRegExp3 = new RegExp("^[0-9][0-9][H][0-9][0-9]$");
    if (timeRegExp3.test(value)) {
      value = value.replace("H", ":");
    }
    return value;
  }
  return null;
};

export const isTimeValid = (timeStr: string): boolean => {
  const value = getFormattedTime(timeStr);

  const timeRegExp = new RegExp("^[0-9][0-9][:][0-9][0-9]$");
  return value && timeRegExp.test(value);
};

export const getNbByEntityId = (
  object: EntiteSimple,
  nbById: NumberOfObjectsById[]
): number => {
  const foundValue: NumberOfObjectsById = nbById.find((element) => {
    return element.id === object.id;
  });
  return foundValue ? foundValue.nb : 0;
};
