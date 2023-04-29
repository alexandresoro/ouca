import { User, type UserManagerSettings } from "oidc-client-ts";

export const getUser = (config: UserManagerSettings): User | null => {
  if (!config) {
    return null;
  }

  const oidcStorage = sessionStorage.getItem(`oidc.user:${config.authority}:${config.client_id}`);
  if (!oidcStorage) {
    return null;
  }

  return User.fromStorageString(oidcStorage);
};
