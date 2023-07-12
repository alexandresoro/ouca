export const toUrlSearchParams = (
  params: Record<string, string | string[] | number | number[] | boolean | undefined> | undefined
): URLSearchParams => {
  if (params === undefined) {
    return new URLSearchParams();
  }

  // Filter out undefined values and transform remaining values to string
  const reshapedParams = Object.entries(params)
    .filter((entry): entry is [string, string | string[] | number | number[] | boolean] => entry[1] !== undefined)
    .flatMap(([key, value]) => {
      return Array.isArray(value) ? value.map((v) => [key, String(v)]) : [[key, String(value)]];
    });

  return new URLSearchParams(reshapedParams);
};
