import { createContext, useEffect, useState, type FunctionComponent, type PropsWithChildren } from "react";
import { useClient } from "urql";
import { graphql } from "../gql/gql";
import { type GetUserSettingsQuery } from "../gql/graphql";

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
    defaultEstimationNombreId
    defaultNombre
    defaultSexeId
    defaultAgeId
    areAssociesDisplayed
    isMeteoDisplayed
    isDistanceDisplayed
    isRegroupementDisplayed
  }
}
`);

export const UserSettingsContext = createContext<{
  userSettings: GetUserSettingsQuery["settings"];
  updateUserSettings: () => Promise<void> | void;
}>({
  userSettings: null,
  updateUserSettings: () => {
    /**/
  },
});

const UserSettingsProvider: FunctionComponent<PropsWithChildren> = ({ children }) => {
  const [userSettings, setUserSettings] = useState<GetUserSettingsQuery["settings"]>(null);

  const client = useClient();

  const updateUserSettings = async () => {
    const { data, error } = await client.query(GET_USER_SETTINGS, {});
    if (error) {
      throw new Error("An error occurred while retrieving user settings");
    }
    if (data?.settings) {
      setUserSettings(data.settings);
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
      {userSettings && children}
    </UserSettingsContext.Provider>
  );
};

export default UserSettingsProvider;
