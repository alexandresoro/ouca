import type { NumberEstimate, NumberEstimateExtended } from "@ou-ca/common/api/entities/number-estimate";
import { type UpsertNumberEstimateInput, upsertNumberEstimateResponse } from "@ou-ca/common/api/number-estimate";
import { useQueryClient } from "@tanstack/react-query";
import { type FunctionComponent, useState } from "react";
import { useTranslation } from "react-i18next";
import useApiMutation from "../../../hooks/api/useApiMutation";
import useSnackbar from "../../../hooks/useSnackbar";
import ContentContainerLayout from "../../../layouts/ContentContainerLayout";
import useApiExportEntities from "../../../services/api/export/useApiExportEntities";
import EntityUpsertDialog from "../common/EntityUpsertDialog";
import ManageTopBar from "../common/ManageTopBar";
import EstimationNombreCreate from "./EstimationNombreCreate";
import EstimationNombreDeleteDialog from "./EstimationNombreDeleteDialog";
import EstimationNombreTable from "./EstimationNombreTable";
import EstimationNombreUpdate from "./EstimationNombreUpdate";

const EstimationNombrePage: FunctionComponent = () => {
  const { t } = useTranslation();

  const queryClient = useQueryClient();

  const { displayNotification } = useSnackbar();

  const [upsertNumberEstimateDialog, setUpsertNumberEstimateDialog] = useState<
    null | { mode: "create" } | { mode: "update"; numberEstimate: NumberEstimate }
  >(null);
  const [numberEstimateToDelete, setNumberEstimateToDelete] = useState<NumberEstimateExtended | null>(null);

  const { mutate: createNumberEstimate } = useApiMutation(
    {
      path: "/number-estimates",
      method: "POST",
      schema: upsertNumberEstimateResponse,
    },
    {
      onSettled: async () => {
        await queryClient.invalidateQueries(["API", "numberEstimateTable"]);
      },
      onSuccess: () => {
        displayNotification({
          type: "success",
          message: t("retrieveGenericSaveSuccess"),
        });
        setUpsertNumberEstimateDialog(null);
      },
      onError: (e) => {
        if (e.status === 409) {
          displayNotification({
            type: "error",
            message: t("numberPrecisionAlreadyExistingError"),
          });
        } else {
          displayNotification({
            type: "error",
            message: t("retrieveGenericSaveError"),
          });
        }
      },
    },
  );

  const { mutate: updateNumberEstimate } = useApiMutation(
    {
      method: "PUT",
      schema: upsertNumberEstimateResponse,
    },
    {
      onSettled: async () => {
        await queryClient.invalidateQueries(["API", "numberEstimateTable"]);
      },
      onSuccess: () => {
        displayNotification({
          type: "success",
          message: t("retrieveGenericSaveSuccess"),
        });
        setUpsertNumberEstimateDialog(null);
      },
      onError: (e) => {
        if (e.status === 409) {
          displayNotification({
            type: "error",
            message: t("numberPrecisionAlreadyExistingError"),
          });
        } else {
          displayNotification({
            type: "error",
            message: t("retrieveGenericSaveError"),
          });
        }
      },
    },
  );

  const { mutate: deleteNumberEstimate } = useApiMutation(
    { method: "DELETE" },
    {
      onSettled: async () => {
        await queryClient.invalidateQueries(["API", "numberEstimateTable"]);
      },
      onSuccess: () => {
        displayNotification({
          type: "success",
          message: t("deleteConfirmationMessage"),
        });
        setNumberEstimateToDelete(null);
      },
      onError: () => {
        displayNotification({
          type: "error",
          message: t("deleteErrorMessage"),
        });
      },
    },
  );

  const { mutate: generateExport } = useApiExportEntities({ filename: t("numberPrecisions") });

  const handleCreateClick = () => {
    setUpsertNumberEstimateDialog({ mode: "create" });
  };

  const handleUpdateClick = (numberEstimate: NumberEstimate) => {
    setUpsertNumberEstimateDialog({ mode: "update", numberEstimate });
  };

  const handleExportClick = () => {
    generateExport({ path: "/generate-export/number-estimates" });
  };

  const handleCreateNumberEstimate = (input: UpsertNumberEstimateInput) => {
    createNumberEstimate({ body: input });
  };

  const handleUpdateNumberEstimate = (id: string, input: UpsertNumberEstimateInput) => {
    updateNumberEstimate({ path: `/number-estimates/${id}`, body: input });
  };

  const handleDeleteNumberEstimate = (numberEstimateToDelete: NumberEstimateExtended) => {
    deleteNumberEstimate({ path: `/number-estimates/${numberEstimateToDelete.id}` });
  };

  return (
    <>
      <ManageTopBar title={t("numberPrecisions")} onClickCreate={handleCreateClick} onClickExport={handleExportClick} />
      <ContentContainerLayout>
        <EstimationNombreTable
          onClickUpdateNumberEstimate={handleUpdateClick}
          onClickDeleteNumberEstimate={setNumberEstimateToDelete}
        />
      </ContentContainerLayout>
      <EntityUpsertDialog
        open={upsertNumberEstimateDialog != null}
        onClose={() => setUpsertNumberEstimateDialog(null)}
        title={
          upsertNumberEstimateDialog?.mode === "create"
            ? t("numberPrecisionCreationTitle")
            : upsertNumberEstimateDialog?.mode === "update"
              ? t("numberPrecisionEditionTitle")
              : undefined
        }
      >
        {upsertNumberEstimateDialog?.mode === "create" && (
          <EstimationNombreCreate
            onCancel={() => setUpsertNumberEstimateDialog(null)}
            onSubmit={handleCreateNumberEstimate}
          />
        )}
        {upsertNumberEstimateDialog?.mode === "update" && (
          <EstimationNombreUpdate
            numberEstimate={upsertNumberEstimateDialog.numberEstimate}
            onCancel={() => setUpsertNumberEstimateDialog(null)}
            onSubmit={handleUpdateNumberEstimate}
          />
        )}
      </EntityUpsertDialog>
      <EstimationNombreDeleteDialog
        numberEstimateToDelete={numberEstimateToDelete}
        onCancelDeletion={() => setNumberEstimateToDelete(null)}
        onConfirmDeletion={handleDeleteNumberEstimate}
      />
    </>
  );
};

export default EstimationNombrePage;
