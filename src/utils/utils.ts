export function buildArgRegexFromKey(
  argKey: string,
  delimiter: string
): RegExp {
  return new RegExp("(" + argKey + ")" + delimiter + "(.*)$");
}
