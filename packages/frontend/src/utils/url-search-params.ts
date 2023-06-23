export const toUrlSearchParams = (
  params: Record<string, string | number | boolean | undefined> | undefined
): URLSearchParams => {
  if (params === undefined) {
    return new URLSearchParams();
  }

  // Filter out undefined values and transform remaining values to string
  const reshapedParams = Object.entries(params)
    .filter((entry): entry is [string, string | number] => entry[1] !== undefined)
    .map(([key, value]) => {
      return [key, String(value)];
    });

  return new URLSearchParams(reshapedParams);
};
