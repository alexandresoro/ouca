import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useSnackbar from "../../../hooks/useSnackbar";
import EspeceEdit from "./EspeceEdit";

const EspeceCreate: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { displayNotification } = useSnackbar();

  return <EspeceEdit title={t("speciesCreationTitle")} />;
};

export default EspeceCreate;
