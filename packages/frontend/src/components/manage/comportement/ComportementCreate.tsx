import { upsertBehaviorResponse, type UpsertBehaviorInput } from "@ou-ca/common/api/behavior";
import { type FunctionComponent } from "react";
import { type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useApiMutation from "../../../hooks/api/useApiMutation";
import useSnackbar from "../../../hooks/useSnackbar";
import ComportementEdit from "./ComportementEdit";

type ComportementCreateProps = {
  onCancel?: () => void;
  onSubmit?: (input: UpsertBehaviorInput) => void;
};

const ComportementCreate: FunctionComponent<ComportementCreateProps> = ({ onCancel, onSubmit }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { displayNotification } = useSnackbar();

  const { mutate } = useApiMutation(
    {
      path: "/behaviors",
      method: "POST",
      schema: upsertBehaviorResponse,
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
            message: t("behaviorAlreadyExistingError"),
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

  const handleSubmit: SubmitHandler<UpsertBehaviorInput> = (input) => {
    mutate({ body: input });
  };

  return (
    <ComportementEdit title={t("behaviorCreationTitle")} onCancel={() => navigate("..")} onSubmit={handleSubmit} />
  );
};

export default ComportementCreate;
