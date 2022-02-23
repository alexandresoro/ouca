const CODE_LENGTH = 4;

export default (q: string | null | undefined): string[] => {
  if (!q || !q.length || q.length > 4 || isNaN(q as unknown as number)) {
    return [];
  }

  const matchingCodes: string[] = [];
  matchingCodes.push(q); // 3 -> 3xxx, 18 -> 18xx, 645 -> 645x, 7291 -> 7291

  for (let i = 2; i <= CODE_LENGTH; i++) {
    if (q.length < i) {
      matchingCodes.push(q.padStart(i, "0"));
    }
  }

  return matchingCodes;
};
