import { getSettingsResponse, type GetSettingsResponse } from "@ou-ca/common/api/settings";
import { createContext, useState, type FunctionComponent, type PropsWithChildren } from "react";
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
  const [userSettings, setUserSettings] = useState<GetSettingsResponse | null>(null);

  const { data: settings, refetch } = useApiQuery(
    {
      path: "/settings",
      schema: getSettingsResponse,
    },
    {
      onSuccess: (resultSettings) => {
        setUserSettings(resultSettings);
      },
    }
  );

  return (
    <UserSettingsContext.Provider
      value={{
        userSettings,
        refetchSettings: () => refetch,
      }}
    >
      {userSettings && settings && children}
    </UserSettingsContext.Provider>
  );
};

export default UserSettingsProvider;
