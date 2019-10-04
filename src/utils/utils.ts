import * as _ from "lodash";

export function buildArgRegexFromKey(
  argKey: string,
  delimiter: string
): RegExp {
  return new RegExp("(" + argKey + ")" + delimiter + "(.*)$");
}

export const toCamel = (s: string): string => {
  return s.replace(/([-_][a-z])/gi, ($1) => {
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
  return _.map(objects, (object) => {
    return object[attributeName];
  });
};
