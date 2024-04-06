import { useApiMe } from "@services/api/me/api-me-queries";
import { getFullName, getInitials } from "@utils/name-utils";

export const useUser = () => {
  const { data: user } = useApiMe();

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

/**
 * Hook to get the user settings.
 * can be `undefined` if the settings are not loaded yet,
 * can be `null` if the user has no settings
 */
export const useUserSettings = () => {
  const { data: user } = useApiMe();
  return user?.settings;
};
