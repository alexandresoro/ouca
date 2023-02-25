import { TextField, type TextFieldProps } from "@mui/material";
import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";

const FilterTextField: FunctionComponent<TextFieldProps> = (props) => {
  const { t } = useTranslation();

  return (
    <>
      <TextField className="w-[40ch]" label={t("filter")} variant="standard" margin="dense" {...props} />
    </>
  );
};

export default FilterTextField;
