import { type User } from "oidc-client-ts";

export const getFullName = (user: User | null | undefined): string | null => {
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

export const getInitials = (user: User | null | undefined): string | null => {
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
