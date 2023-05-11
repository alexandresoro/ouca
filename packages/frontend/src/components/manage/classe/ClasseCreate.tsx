import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useSnackbar from "../../../hooks/useSnackbar";
import ClasseEdit from "./ClasseEdit";

const ClasseCreate: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { displayNotification } = useSnackbar();

  return <ClasseEdit title={t("speciesClassCreationTitle")} />;
};

export default ClasseCreate;
