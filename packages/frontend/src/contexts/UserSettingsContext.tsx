import { getSettingsResponse, type GetSettingsResponse } from "@ou-ca/common/api/settings";
import { createContext, useEffect, type FunctionComponent, type PropsWithChildren } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
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
  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    data: userSettings,
    error,
    isLoading,
    isFetching,
    refetch,
  } = useApiQuery(
    {
      path: "/settings",
      schema: getSettingsResponse,
    },
    {
      notifyOnChangeProps: ["data", "error"],
      staleTime: Infinity,
      retry: (count, error) => {
        // If a 404 is returned, don't "lose time" retrying,
        // otherwise use regular retry mechanism
        return !(error?.status === 404) && count < 3;
      },
    }
  );

  useEffect(() => {
    if (error?.status === 404 && !isFetching) {
      // No user settings have been found, redirect to new account page
      navigate("/new-account", { replace: true });
    }
  }, [error, isFetching, navigate]);

  return (
    <UserSettingsContext.Provider
      value={{
        userSettings: userSettings ?? null,
        refetchSettings: () => refetch,
      }}
    >
      {isLoading && (
        <div className="flex h-[100dvh] justify-center items-center">
          <div className="flex flex-col gap-2 items-center">
            <span className="text-xl text-primary">{t("loading.settingsOngoing")}</span>
            <span className="loading loading-lg loading-ring text-primary" />
          </div>
        </div>
      )}
      {userSettings && children}
    </UserSettingsContext.Provider>
  );
};

export default UserSettingsProvider;
