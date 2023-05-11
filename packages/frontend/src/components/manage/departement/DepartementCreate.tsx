import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useSnackbar from "../../../hooks/useSnackbar";
import DepartementEdit from "./DepartementEdit";

const DepartementCreate: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { displayNotification } = useSnackbar();

  return <DepartementEdit title={t("departmentCreationTitle")} />;
};

export default DepartementCreate;
