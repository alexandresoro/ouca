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
