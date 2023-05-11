import { useQueryClient } from "@tanstack/react-query";
import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import useSnackbar from "../../../hooks/useSnackbar";
import MeteoEdit from "./MeteoEdit";

const MeteoUpdate: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { id } = useParams();

  const { displayNotification } = useSnackbar();

  const queryClient = useQueryClient();

  if (!id) {
    return null;
  }

  return <MeteoEdit title={t("weatherEditionTitle")} />;
};

export default MeteoUpdate;
