import { configAtom } from "@services/config/config";
import { atom } from "jotai";
import { User, type UserManagerSettings, WebStorageStateStore } from "oidc-client-ts";

const store = window.localStorage;

export const oidcConfigAtom = atom<UserManagerSettings>((get) => {
  const oidcConfig = get(configAtom).oidc;
  return {
    ...oidcConfig,
    redirect_uri: `${window.location.protocol}//${window.location.host}/`,
    scope: "openid email profile offline_access",
    userStore: new WebStorageStateStore({ store }),
  };
});

export const oidcUserAtom = atom<User | null>((get) => {
  const oidcConfig = get(configAtom).oidc;

  const oidcStorage = store.getItem(`oidc.user:${oidcConfig.authority}:${oidcConfig.client_id}`);

  if (!oidcStorage) {
    return null;
  }

  return User.fromStorageString(oidcStorage);
});
