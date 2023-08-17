import { upsertClassResponse, type UpsertClassInput } from "@ou-ca/common/api/species-class";
import { type FunctionComponent } from "react";
import { type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useApiMutation from "../../../hooks/api/useApiMutation";
import useSnackbar from "../../../hooks/useSnackbar";
import ClasseEdit from "./ClasseEdit";

type ClasseCreateProps = {
  onCancel?: () => void;
  onSubmit?: (input: UpsertClassInput) => void;
};

const ClasseCreate: FunctionComponent<ClasseCreateProps> = ({ onCancel, onSubmit }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { displayNotification } = useSnackbar();

  const { mutate } = useApiMutation(
    {
      path: "/classes",
      method: "POST",
      schema: upsertClassResponse,
    },
    {
      onSuccess: () => {
        displayNotification({
          type: "success",
          message: t("retrieveGenericSaveSuccess"),
        });
        navigate("..");
      },
      onError: (e) => {
        if (e.status === 409) {
          displayNotification({
            type: "error",
            message: t("speciesClassAlreadyExistingError"),
          });
        } else {
          displayNotification({
            type: "error",
            message: t("retrieveGenericSaveError"),
          });
        }
      },
    }
  );

  const onSubmitLegacy: SubmitHandler<UpsertClassInput> = (input) => {
    mutate({ body: input });
  };

  return (
    <ClasseEdit title={t("speciesClassCreationTitle")} onCancel={() => navigate("..")} onSubmit={onSubmitLegacy} />
  );
};

export default ClasseCreate;
