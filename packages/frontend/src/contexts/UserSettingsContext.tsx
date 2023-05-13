import { getSettingsResponse, type GetSettingsResponse } from "@ou-ca/common/api/settings";
import { createContext, useEffect, type FunctionComponent, type PropsWithChildren } from "react";
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
  const navigate = useNavigate();

  const {
    data: userSettings,
    error,
    isLoading,
    isFetching,
    refetch,
  } = useApiQuery({
    path: "/settings",
    schema: getSettingsResponse,
  });

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
      {isLoading && <progress className="progress progress-primary w-56" />}
      {userSettings && children}
    </UserSettingsContext.Provider>
  );
};

export default UserSettingsProvider;
