import { useQueryClient } from "@tanstack/react-query";
import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import useSnackbar from "../../../hooks/useSnackbar";
import ObservateurEdit from "./ObservateurEdit";

const ObservateurUpdate: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { id } = useParams();

  const { displayNotification } = useSnackbar();

  const queryClient = useQueryClient();

  if (!id) {
    return null;
  }

  return <ObservateurEdit title={t("observerEditionTitle")} />;
};

export default ObservateurUpdate;
