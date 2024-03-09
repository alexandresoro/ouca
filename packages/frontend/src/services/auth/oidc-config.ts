import { configAtom } from "@services/config/config";
import { atom } from "jotai";
import { type UserManagerSettings, WebStorageStateStore } from "oidc-client-ts";

export const oidcConfigAtom = atom<UserManagerSettings>((get) => {
  const oidcConfig = get(configAtom).oidc;
  return {
    ...oidcConfig,
    redirect_uri: `${window.location.protocol}//${window.location.host}/`,
    scope: "openid email profile offline_access",
    userStore: new WebStorageStateStore({ store: window.localStorage }),
  };
});
