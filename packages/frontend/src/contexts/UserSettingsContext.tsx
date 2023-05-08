import { getSettingsResponse, type GetSettingsResponse } from "@ou-ca/common/api/settings";
import { createContext, type FunctionComponent, type PropsWithChildren } from "react";
import useApiQuery from "../hooks/api/useApiQuery";

export const UserSettingsContext = createContext<{
  userSettings: GetSettingsResponse | null;
  refetchSettings: () => unknown;
}>({
  userSettings: null,
  refetchSettings: () => {
    /**/
  },
});

const UserSettingsProvider: FunctionComponent<PropsWithChildren> = ({ children }) => {
  const { data: userSettings, refetch } = useApiQuery({
    path: "/settings",
    schema: getSettingsResponse,
  });

  return (
    <UserSettingsContext.Provider
      value={{
        userSettings: userSettings ?? null,
        refetchSettings: () => refetch,
      }}
    >
      {userSettings && children}
    </UserSettingsContext.Provider>
  );
};

export default UserSettingsProvider;
