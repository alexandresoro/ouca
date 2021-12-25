import { UserInfo } from "../model/graphql";

export const getFullName = (userInfo: UserInfo | null): string | null => {
  if (!userInfo) {
    return null;
  }
  let fullName = "";
  if (userInfo?.firstName) {
    fullName += userInfo.firstName;
  }

  if (userInfo?.lastName) {
    fullName += " ";
    fullName += userInfo?.lastName;
  }

  return fullName;
};

export const getInitials = (userInfo: UserInfo | null): string | null => {
  if (!userInfo) {
    return null;
  }
  let initials = "";
  if (userInfo?.firstName.length) {
    initials += userInfo.firstName[0];
  }

  if (userInfo?.lastName?.length) {
    initials += userInfo?.lastName[0];
  }

  return initials;
};
