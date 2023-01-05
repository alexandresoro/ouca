import { Typography } from "@mui/material";
import { FunctionComponent, useContext } from "react";
import { UserContext } from "../contexts/UserContext";

const TempPage: FunctionComponent = () => {
  const { userInfo } = useContext(UserContext);

  return <>{userInfo && <Typography color="textPrimary">{JSON.stringify(userInfo)}</Typography>}</>;
};

export default TempPage;
