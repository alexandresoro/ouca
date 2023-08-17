import { upsertLocalityResponse, type UpsertLocalityInput } from "@ou-ca/common/api/locality";
import { type FunctionComponent } from "react";
import { type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useApiMutation from "../../../hooks/api/useApiMutation";
import useSnackbar from "../../../hooks/useSnackbar";
import LieuDitEdit from "./LieuDitEdit";

type LieuDitCreateProps = {
  onCancel?: () => void;
  onSubmit?: (input: UpsertLocalityInput) => void;
};

const LieuDitCreate: FunctionComponent<LieuDitCreateProps> = ({ onCancel, onSubmit }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { displayNotification } = useSnackbar();

  const { mutate } = useApiMutation(
    {
      path: "/localities",
      method: "POST",
      schema: upsertLocalityResponse,
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
            message: t("localityAlreadyExistingError"),
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

  const onSubmitLegacy: SubmitHandler<UpsertLocalityInput> = (input) => {
    mutate({ body: input });
  };

  return <LieuDitEdit title={t("localityCreationTitle")} onCancel={() => navigate("..")} onSubmit={onSubmitLegacy} />;
};

export default LieuDitCreate;
