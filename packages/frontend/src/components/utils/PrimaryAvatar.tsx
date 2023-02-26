import { Avatar } from "@mui/material";
import { type FunctionComponent, type PropsWithChildren } from "react";

const PrimaryAvatar: FunctionComponent<PropsWithChildren> = ({ children }) => {
  return <Avatar className="bg-primary dark:bg-white">{children}</Avatar>;
};

export default PrimaryAvatar;
