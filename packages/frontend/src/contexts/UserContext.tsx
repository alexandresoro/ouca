import { createContext, useState, type ReactElement } from "react";
import { type UserInfo } from "../gql/graphql";
import useAppContext from "../hooks/useAppContext";

export const UserContext = createContext<{
  userInfo: UserInfo | null;
  setUserInfo: (userInfo: UserInfo | null) => void;
}>({
  userInfo: null,
  setUserInfo: () => {
    /**/
  },
});

export const UserProvider = ({ children }: { children: ReactElement }): ReactElement => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  const { appContext } = useAppContext();

  const setUserInfoAction = (userInfo: UserInfo | null) => {
    setUserInfo(userInfo);
    if (appContext.isSentryEnabled) {
      void import("../utils/sentry").then(({ setUser }) => {
        setUser(userInfo);
      });
    }
  };

  return (
    <UserContext.Provider
      value={{
        userInfo,
        setUserInfo: setUserInfoAction,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
