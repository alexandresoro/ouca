import { Paper, styled } from "@mui/material";

export default styled(Paper)(({ theme }) => {
  return {
    display: "flex",
    flex: "0 0 auto",
    backgroundColor: theme.palette.mode === "dark" ? theme.palette.background.default : theme.palette.primary.main,
    height: "76px",
    lineHeight: "76px",
    h1: {
      lineHeight: "inherit",
      color: "white"
    },
    width: "100%",
    boxSizing: "border-box",
    paddingLeft: "50px",
    paddingRight: "50px",
    borderRadius: "0"
  };
});
