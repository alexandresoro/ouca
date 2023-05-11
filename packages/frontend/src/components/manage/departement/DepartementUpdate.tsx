import { useQueryClient } from "@tanstack/react-query";
import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import useSnackbar from "../../../hooks/useSnackbar";
import DepartementEdit from "./DepartementEdit";

const DepartementUpdate: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { id } = useParams();

  const { displayNotification } = useSnackbar();

  const queryClient = useQueryClient();

  if (!id) {
    return null;
  }

  return <DepartementEdit title={t("departmentEditionTitle")} />;
};

export default DepartementUpdate;
