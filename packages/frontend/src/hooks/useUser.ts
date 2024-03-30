import { useApiMe } from "@services/api/me/api-me-queries";
import { getFullName, getInitials } from "@utils/name-utils";

const ROLES = ["admin", "contributor", "user"] as const;

const getRole = (roles: string[]): (typeof ROLES)[number] | null => {
  return ROLES.find((existingRole) => roles.includes(existingRole)) ?? null;
};

export const useUser = () => {
  const user = useApiMe();

  if (user === undefined) {
    return undefined;
  }

  const fullName = getFullName([user.user.given_name ?? "", user.user.family_name ?? ""]);
  const initials = getInitials([user.user.given_name ?? "", user.user.family_name ?? ""]);

  const role = getRole(user.user.roles ?? []);

  return {
    ...user,
    fullName,
    initials,
    role,
  };
};
