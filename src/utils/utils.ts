import * as _ from "lodash";
import { EntiteSimple } from "ouca-common/entite-simple.object";
import { NumberOfObjectsById } from "../objects/number-of-objects-by-id.object";

export const toCamel = (s: string): string => {
  return s.replace(/([-_][a-z])/gi, $1 => {
    return $1
      .toUpperCase()
      .replace("-", "")
      .replace("_", "");
  });
};

export const areArraysContainingSameValues = <T>(
  firstArray: T[],
  secondArray: T[]
): boolean => {
  return (
    _.intersection(firstArray, secondArray).length ===
    _.union(firstArray, secondArray).length
  );
};

export const getArrayFromObjects = <T>(
  objects: T[],
  attributeName: string
): number[] => {
  return _.map(objects, object => {
    return object[attributeName];
  });
};

export const isIdInListIds = (ids: number[], idToFind: number): boolean => {
  return !!ids.find(id => {
    return id === idToFind;
  });
};

export const getFormattedTime = (timeStr: string): string => {
  if (timeStr) {
    let value = timeStr;
    const dateRegExp1 = new RegExp("^[0-9][0-9][0-9][0-9]$");
    if (dateRegExp1.test(value)) {
      value =
        value.charAt(0) +
        value.charAt(1) +
        ":" +
        value.charAt(2) +
        value.charAt(3);
    }

    const dateRegExp2 = new RegExp("^[0-9][0-9][h][0-9][0-9]$");
    if (dateRegExp2.test(value)) {
      value = value.replace("h", ":");
    }

    const dateRegExp3 = new RegExp("^[0-9][0-9][H][0-9][0-9]$");
    if (dateRegExp3.test(value)) {
      value = value.replace("H", ":");
    }
    return value;
  }
  return null;
};

export const isTimeValid = (timeStr: string): boolean => {
  const value = getFormattedTime(timeStr);

  const finalDateRegExp = new RegExp("^[0-9][0-9][:][0-9][0-9]$");
  return !!value && !!finalDateRegExp.test(value);
};

export const getNbByEntityId = (
  object: EntiteSimple,
  nbById: NumberOfObjectsById[]
): number => {
  const foundValue: NumberOfObjectsById = _.find(nbById, element => {
    return element.id === object.id;
  });
  return foundValue ? foundValue.nb : 0;
};
