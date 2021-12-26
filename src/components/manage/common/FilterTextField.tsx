import { TextField, TextFieldProps } from "@mui/material";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";

export default function FilterTextField(props: TextFieldProps): ReactElement {
  const { t } = useTranslation();

  return (
    <>
      <TextField
        label={t("filter")}
        variant="standard"
        sx={{
          width: "40ch"
        }}
        margin="dense"
        {...props}
      />
    </>
  );
}
