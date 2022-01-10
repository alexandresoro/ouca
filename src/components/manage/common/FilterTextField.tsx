import { TextField, TextFieldProps } from "@mui/material";
import { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";

const FilterTextField: FunctionComponent<TextFieldProps> = (props) => {
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
};

export default FilterTextField;
