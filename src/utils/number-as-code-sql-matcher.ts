const CODE_LENGTH = 4;

export default (q: string): string[] => {

  if (!q || !q.length || q.length > 4 || isNaN(q as unknown as number)) {
    return [];
  }

  const matchingCodes: string[] = [];
  matchingCodes.push(q) // 3 -> 3xxx, 18 -> 18xx, 645 -> 645x, 7291 -> 7291

  if (q.length === 1) {
    matchingCodes.push(q.padStart(2, '0')) // 3 -> 03xx
  }

  if (q.length < 3) {
    matchingCodes.push(q.padStart(3, '0')) // 3 -> 003x, 18 -> 018x
  }

  matchingCodes.push(q.padStart(CODE_LENGTH, '0')); // 3 -> 0003, 18 -> 0018, 645 -> 0645, 7291 -> 7291

  return matchingCodes;
}