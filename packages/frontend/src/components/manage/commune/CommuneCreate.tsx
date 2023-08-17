import { upsertTownResponse, type UpsertTownInput } from "@ou-ca/common/api/town";
import { type FunctionComponent } from "react";
import { type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useApiMutation from "../../../hooks/api/useApiMutation";
import useSnackbar from "../../../hooks/useSnackbar";
import CommuneEdit from "./CommuneEdit";

type CommuneCreateProps = {
  onCancel?: () => void;
  onSubmit?: (input: UpsertTownInput) => void;
};

const CommuneCreate: FunctionComponent<CommuneCreateProps> = ({ onCancel, onSubmit }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { displayNotification } = useSnackbar();

  const { mutate } = useApiMutation(
    {
      path: "/towns",
      method: "POST",
      schema: upsertTownResponse,
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
            message: t("townAlreadyExistingError"),
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

  const onSubmitLegacy: SubmitHandler<UpsertTownInput> = (input) => {
    mutate({ body: input });
  };

  return <CommuneEdit title={t("townCreationTitle")} onCancel={() => navigate("..")} onSubmit={onSubmitLegacy} />;
};

export default CommuneCreate;
