import { useContext } from "react";
import { UserSettingsContext } from "../contexts/UserSettingsContext";

export default () => {
  const { userSettings, updateUserSettings } = useContext(UserSettingsContext);
  // Here we can assert that user settings cannot be null as we do not display components inside otherwise from the context
  return {
    userSettings: userSettings as NonNullable<typeof userSettings>,
    updateUserSettings,
  };
};
