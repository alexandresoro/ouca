export const getInitials = (name: string | string[]): string => {
  const namesArray = Array.isArray(name) ? name : [name];

  const nameParts = namesArray.flatMap((name) => name.split(" ")).filter((part) => part.length > 0);

  if (nameParts.length === 0) {
    return "";
  }

  return nameParts
    .map((name) => name[0])
    .join("")
    .toUpperCase();
};

export const getFullName = (name: string | string[]): string => {
  const namesArray = Array.isArray(name) ? name : [name];

  const nameParts = namesArray.flatMap((name) => name.split(" ")).filter((part) => part.length > 0);

  if (nameParts.length === 0) {
    return "";
  }

  return nameParts.join(" ");
};
