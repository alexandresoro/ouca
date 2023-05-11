import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useSnackbar from "../../../hooks/useSnackbar";
import EstimationNombreEdit from "./EstimationNombreEdit";

const EstimationNombreCreate: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { displayNotification } = useSnackbar();

  return <EstimationNombreEdit title={t("numberPrecisionCreationTitle")} />;
};

export default EstimationNombreCreate;
