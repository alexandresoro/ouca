import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useSnackbar from "../../../hooks/useSnackbar";
import MilieuEdit from "./MilieuEdit";

const MilieuCreate: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { displayNotification } = useSnackbar();

  return <MilieuEdit title={t("environmentCreationTitle")} />;
};

export default MilieuCreate;
