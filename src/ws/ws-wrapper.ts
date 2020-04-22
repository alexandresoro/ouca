export const wrapObject = <T>(
  message: T,
  key: string
): { [key: string]: T } => {
  const obj = {};
  obj[key] = message;
  return obj;
};
