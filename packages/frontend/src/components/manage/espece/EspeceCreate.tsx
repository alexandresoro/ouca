import { upsertSpeciesResponse, type UpsertSpeciesInput } from "@ou-ca/common/api/species";
import { type FunctionComponent } from "react";
import { type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useApiMutation from "../../../hooks/api/useApiMutation";
import useSnackbar from "../../../hooks/useSnackbar";
import EspeceEdit from "./EspeceEdit";

type EspeceCreateProps = {
  onCancel?: () => void;
  onSubmit?: (input: UpsertSpeciesInput) => void;
};

const EspeceCreate: FunctionComponent<EspeceCreateProps> = ({ onCancel, onSubmit }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { displayNotification } = useSnackbar();

  const { mutate } = useApiMutation(
    {
      path: "/species",
      method: "POST",
      schema: upsertSpeciesResponse,
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
            message: t("speciesAlreadyExistingError"),
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

  const handleSubmit: SubmitHandler<UpsertSpeciesInput> = (input) => {
    mutate({ body: input });
  };

  return <EspeceEdit title={t("speciesCreationTitle")} onCancel={() => navigate("..")} onSubmit={handleSubmit} />;
};

export default EspeceCreate;
