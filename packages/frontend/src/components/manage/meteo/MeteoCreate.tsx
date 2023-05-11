import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useSnackbar from "../../../hooks/useSnackbar";
import MeteoEdit from "./MeteoEdit";

const MeteoCreate: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { displayNotification } = useSnackbar();

  return <MeteoEdit title={t("weatherCreationTitle")} />;
};

export default MeteoCreate;
