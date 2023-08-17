import { upsertAgeResponse } from "@ou-ca/common/api/age";
import { type AgeExtended } from "@ou-ca/common/entities/age";
import { useQueryClient } from "@tanstack/react-query";
import { useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useApiExportEntities from "../../../hooks/api/useApiExportEntities";
import useApiMutation from "../../../hooks/api/useApiMutation";
import useSnackbar from "../../../hooks/useSnackbar";
import ContentContainerLayout from "../../layout/ContentContainerLayout";
import ManageTopBar from "../common/ManageTopBar";
import AgeDeleteDialog from "./AgeDeleteDialog";
import AgeTable from "./AgeTable";

const AgePage: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const { displayNotification } = useSnackbar();

  const [upsertAgeDialog, setUpsertAgeDialog] = useState<null | { mode: "create" } | { mode: "update"; id: string }>(
    null
  );
  const [ageToDelete, setAgeToDelete] = useState<AgeExtended | null>(null);

  const { mutate: createAge } = useApiMutation(
    {
      path: "/ages",
      method: "POST",
      schema: upsertAgeResponse,
    },
    {
      onSettled: async () => {
        await queryClient.invalidateQueries(["API", "ageTable"]);
      },
      onSuccess: () => {
        displayNotification({
          type: "success",
          message: t("retrieveGenericSaveSuccess"),
        });
        setUpsertAgeDialog(null);
      },
      onError: (e) => {
        if (e.status === 409) {
          displayNotification({
            type: "error",
            message: t("ageAlreadyExistingError"),
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

  const { mutate: updateAge } = useApiMutation(
    {
      method: "PUT",
      schema: upsertAgeResponse,
    },
    {
      onSettled: async () => {
        await queryClient.invalidateQueries(["API", "ageTable"]);
      },
      onSuccess: () => {
        displayNotification({
          type: "success",
          message: t("retrieveGenericSaveSuccess"),
        });
        setUpsertAgeDialog(null);
      },
      onError: (e) => {
        if (e.status === 409) {
          displayNotification({
            type: "error",
            message: t("ageAlreadyExistingError"),
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

  const { mutate: deleteAge } = useApiMutation(
    { method: "DELETE" },
    {
      onSettled: async () => {
        await queryClient.invalidateQueries(["API", "ageTable"]);
      },
      onSuccess: () => {
        displayNotification({
          type: "success",
          message: t("deleteConfirmationMessage"),
        });
        setAgeToDelete(null);
      },
      onError: () => {
        displayNotification({
          type: "error",
          message: t("deleteErrorMessage"),
        });
      },
    }
  );

  const { mutate: generateExport } = useApiExportEntities({ filename: t("ages") });

  const handleUpdateClick = (id: string) => {
    navigate(`edit/${id}`);
  };

  const handleExportClick = () => {
    generateExport({ path: "/generate-export/ages" });
  };

  const handleDeleteAge = (ageToDelete: AgeExtended) => {
    deleteAge({ path: `/ages/${ageToDelete.id}` });
  };

  return (
    <>
      <ManageTopBar title={t("ages")} onClickExport={handleExportClick} />
      <ContentContainerLayout>
        <AgeTable onClickUpdateAge={handleUpdateClick} onClickDeleteAge={setAgeToDelete} />
      </ContentContainerLayout>
      <AgeDeleteDialog
        ageToDelete={ageToDelete}
        onCancelDeletion={() => setAgeToDelete(null)}
        onConfirmDeletion={handleDeleteAge}
      />
    </>
  );
};

export default AgePage;
