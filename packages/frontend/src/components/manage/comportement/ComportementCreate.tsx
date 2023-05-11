import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useSnackbar from "../../../hooks/useSnackbar";
import ComportementEdit from "./ComportementEdit";

const ComportementCreate: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { displayNotification } = useSnackbar();

  return <ComportementEdit title={t("behaviorCreationTitle")} />;
};

export default ComportementCreate;
