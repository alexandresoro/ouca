import { getSettingsResponse, type GetSettingsResponse } from "@ou-ca/common/api/settings";
import { createContext, useEffect, useState, type FunctionComponent, type PropsWithChildren } from "react";
import { useClient } from "urql";
import { graphql } from "../gql/gql";
import { type GetUserSettingsQuery } from "../gql/graphql";
import useApiQuery from "../hooks/api/useApiQuery";

const GET_USER_SETTINGS = graphql(`
query GetUserSettings {
  settings {
    id
    defaultObservateur {
      id
      libelle
    }
    defaultDepartement {
      id
      code
    }
  }
}
`);

export const UserSettingsContext = createContext<{
  userSettings: (GetUserSettingsQuery["settings"] & Partial<GetSettingsResponse>) | null;
  updateUserSettings: () => Promise<void> | void;
}>({
  userSettings: null,
  updateUserSettings: () => {
    /**/
  },
});

const UserSettingsProvider: FunctionComponent<PropsWithChildren> = ({ children }) => {
  const [userSettings, setUserSettings] = useState<
    (GetUserSettingsQuery["settings"] & Partial<GetSettingsResponse>) | null
  >(null);

  const client = useClient();

  const { data: settings } = useApiQuery(
    {
      path: "/settings",
      schema: getSettingsResponse,
    },
    {
      onSuccess: (resultSettings) => {
        setUserSettings((userSettings) => {
          return {
            ...userSettings,
            ...resultSettings,
          };
        });
      },
    }
  );

  const updateUserSettings = async () => {
    const { data, error } = await client.query(GET_USER_SETTINGS, {});
    if (error) {
      throw new Error("An error occurred while retrieving user settings");
    }
    if (data?.settings) {
      const resultSettings = data.settings;
      setUserSettings((userSettings) => {
        return {
          ...userSettings,
          ...resultSettings,
        };
      });
    }
  };

  useEffect(() => {
    updateUserSettings().catch(() => {
      throw new Error("An error has occurred while retrieving the initial user settings");
    });
  }, [client]);

  return (
    <UserSettingsContext.Provider
      value={{
        userSettings,
        updateUserSettings,
      }}
    >
      {userSettings && settings && children}
    </UserSettingsContext.Provider>
  );
};

export default UserSettingsProvider;
