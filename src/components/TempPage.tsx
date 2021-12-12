import { Typography } from "@mui/material";
import { ReactElement, useContext } from "react";
import { UserContext } from "../contexts/UserContext";

export default function TempPage(): ReactElement {

  const { userInfo } = useContext(UserContext);

  return (
    <>
      {userInfo && (
        <Typography color="textPrimary">
          {JSON.stringify(userInfo)}
        </Typography>
      )}
    </>
  )
}