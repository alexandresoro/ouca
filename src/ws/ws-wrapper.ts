export const wrapObject = (
  message: any,
  key: string
): { [key: string]: any } => {
  const obj = {};
  obj[key] = message;
  return obj;
};
