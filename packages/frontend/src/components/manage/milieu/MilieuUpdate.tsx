import { useQueryClient } from "@tanstack/react-query";
import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import useSnackbar from "../../../hooks/useSnackbar";
import MilieuEdit from "./MilieuEdit";

const MilieuUpdate: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { id } = useParams();

  const { displayNotification } = useSnackbar();

  const queryClient = useQueryClient();

  if (!id) {
    return null;
  }

  return <MilieuEdit title={t("environmentEditionTitle")} />;
};

export default MilieuUpdate;
