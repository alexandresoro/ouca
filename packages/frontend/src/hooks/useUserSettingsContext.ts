import { useContext } from "react";
import { UserSettingsContext } from "../contexts/UserSettingsContext";

export default () => {
  const { userSettings, refetchSettings } = useContext(UserSettingsContext);
  // Here we can assert that user settings cannot be null as we do not display components inside otherwise from the context
  return {
    // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
    userSettings: userSettings as NonNullable<typeof userSettings>,
    refetchSettings,
  };
};
