import { Avatar, styled } from "@mui/material";

export default styled(Avatar)(({ theme }) => {
  return {
    backgroundColor: theme.palette.mode === "dark" ? theme.palette.action.active : theme.palette.primary.main
  };
});
