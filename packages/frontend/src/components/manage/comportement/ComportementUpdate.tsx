import { useQueryClient } from "@tanstack/react-query";
import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import useSnackbar from "../../../hooks/useSnackbar";
import ComportementEdit from "./ComportementEdit";

const ComportementUpdate: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { id } = useParams();

  const { displayNotification } = useSnackbar();

  const queryClient = useQueryClient();

  if (!id) {
    return null;
  }

  return <ComportementEdit title={t("behaviorEditionTitle")} />;
};

export default ComportementUpdate;
