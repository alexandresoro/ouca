import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useSnackbar from "../../../hooks/useSnackbar";
import EstimationDistanceEdit from "./EstimationDistanceEdit";

const EstimationDistanceCreate: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { displayNotification } = useSnackbar();

  return <EstimationDistanceEdit title={t("distancePrecisionCreationTitle")}  />;
};

export default EstimationDistanceCreate;
