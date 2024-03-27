import type { User } from "oidc-client-ts";
import { useAuth } from "react-oidc-context";

const ROLES = ["admin", "contributor", "user"] as const;

const getRole = (user: User): (typeof ROLES)[number] | null => {
  const rolesMap = user.profile["urn:zitadel:iam:org:project:roles"] as Record<string, unknown>[] | undefined;
  if (!rolesMap) {
    // Should not happen in practice
    return null;
  }

  const roles = Object.keys(rolesMap);

  return ROLES.find((existingRole) => roles.includes(existingRole)) ?? null;
};

const getFullName = (user: User | null | undefined): string | null => {
  if (!user?.profile) {
    return null;
  }
  let fullName = "";
  if (user.profile.given_name) {
    fullName += user.profile.given_name;
  }

  if (user.profile.family_name) {
    fullName += " ";
    fullName += user.profile.family_name;
  }

  return fullName;
};

const getInitials = (user: User | null | undefined): string | null => {
  if (!user?.profile) {
    return null;
  }
  let initials = "";
  if (user.profile.given_name?.length) {
    initials += user.profile.given_name[0];
  }

  if (user.profile.family_name?.length) {
    initials += user.profile.family_name[0];
  }

  return initials;
};

export const useUser = () => {
  const auth = useAuth();

  const fullName = getFullName(auth.user);
  const initials = getInitials(auth.user);

  const role = auth.user ? getRole(auth.user) : null;

  return {
    auth,
    fullName,
    initials,
    role,
  };
};
