import { useApiMe } from "@services/api/me/api-me-queries";
import { settingsAtom } from "@services/api/me/settingsAtom";
import { getFullName, getInitials } from "@utils/name-utils";
import { useAtomValue } from "jotai";

export const useUser = () => {
  const user = useApiMe();

  if (user === undefined) {
    return undefined;
  }

  const fullName = getFullName([user.user.given_name ?? "", user.user.family_name ?? ""]);
  const initials = getInitials([user.user.given_name ?? "", user.user.family_name ?? ""]);

  return {
    ...user,
    fullName,
    initials,
  };
};

export const useUserSettings = () => useAtomValue(settingsAtom);
