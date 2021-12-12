import React, { createContext, ReactElement, useState } from "react";
import { UserInfo } from "../model/graphql";

export const UserContext = createContext<{
  userInfo: UserInfo | null,
  setUserInfo: (userInfo: UserInfo | null) => void
}>({
  userInfo: null,
  setUserInfo: () => {/**/ }
});

export const UserProvider = ({ children }: { children: ReactElement }): ReactElement => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  return (
    <UserContext.Provider value={{
      userInfo,
      setUserInfo
    }}
    >
      {children}
    </UserContext.Provider>
  );
};