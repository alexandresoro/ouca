import { IconButton, styled } from "@mui/material";

export default styled(IconButton)(({ theme }) => {
  return {
    color: theme.palette.mode === "dark" ? theme.palette.action.active : theme.palette.primary.main
  };
});
