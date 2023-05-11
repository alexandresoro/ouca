import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useSnackbar from "../../../hooks/useSnackbar";
import CommuneEdit from "./CommuneEdit";

const CommuneCreate: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { displayNotification } = useSnackbar();

  return <CommuneEdit title={t("townCreationTitle")} />;
};

export default CommuneCreate;
