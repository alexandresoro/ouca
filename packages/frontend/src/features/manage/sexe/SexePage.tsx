import type { Sex, SexExtended } from "@ou-ca/common/api/entities/sex";
import { type UpsertSexInput, upsertSexResponse } from "@ou-ca/common/api/sex";
import { useQueryClient } from "@tanstack/react-query";
import { type FunctionComponent, useState } from "react";
import { useTranslation } from "react-i18next";
import useApiMutation from "../../../hooks/api/useApiMutation";
import useSnackbar from "../../../hooks/useSnackbar";
import ContentContainerLayout from "../../../layouts/ContentContainerLayout";
import useApiExportEntities from "../../../services/api/export/useApiExportEntities";
import EntityUpsertDialog from "../common/EntityUpsertDialog";
import ManageTopBar from "../common/ManageTopBar";
import SexeCreate from "./SexeCreate";
import SexeDeleteDialog from "./SexeDeleteDialog";
import SexeTable from "./SexeTable";
import SexeUpdate from "./SexeUpdate";

const SexePage: FunctionComponent = () => {
  const { t } = useTranslation();

  const queryClient = useQueryClient();

  const { displayNotification } = useSnackbar();

  const [upsertSexDialog, setUpsertSexDialog] = useState<null | { mode: "create" } | { mode: "update"; sex: Sex }>(
    null,
  );
  const [sexToDelete, setSexToDelete] = useState<SexExtended | null>(null);

  const { mutate: createSex } = useApiMutation(
    {
      path: "/sexes",
      method: "POST",
      schema: upsertSexResponse,
    },
    {
      onSettled: async () => {
        await queryClient.invalidateQueries(["API", "sexTable"]);
      },
      onSuccess: () => {
        displayNotification({
          type: "success",
          message: t("retrieveGenericSaveSuccess"),
        });
        setUpsertSexDialog(null);
      },
      onError: (e) => {
        if (e.status === 409) {
          displayNotification({
            type: "error",
            message: t("sexAlreadyExistingError"),
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

  const { mutate: updateSex } = useApiMutation(
    {
      method: "PUT",
      schema: upsertSexResponse,
    },
    {
      onSettled: async () => {
        await queryClient.invalidateQueries(["API", "sexTable"]);
      },
      onSuccess: () => {
        displayNotification({
          type: "success",
          message: t("retrieveGenericSaveSuccess"),
        });
        setUpsertSexDialog(null);
      },
      onError: (e) => {
        if (e.status === 409) {
          displayNotification({
            type: "error",
            message: t("sexAlreadyExistingError"),
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

  const { mutate: deleteSex } = useApiMutation(
    { method: "DELETE" },
    {
      onSettled: async () => {
        await queryClient.invalidateQueries(["API", "sexTable"]);
      },
      onSuccess: () => {
        displayNotification({
          type: "success",
          message: t("deleteConfirmationMessage"),
        });
        setSexToDelete(null);
      },
      onError: () => {
        displayNotification({
          type: "error",
          message: t("deleteErrorMessage"),
        });
      },
    },
  );

  const { mutate: generateExport } = useApiExportEntities({ filename: t("genders") });

  const handleCreateClick = () => {
    setUpsertSexDialog({ mode: "create" });
  };

  const handleUpdateClick = (sex: Sex) => {
    setUpsertSexDialog({ mode: "update", sex });
  };

  const handleExportClick = () => {
    generateExport({ path: "/generate-export/sexes" });
  };

  const handleCreateSex = (input: UpsertSexInput) => {
    createSex({ body: input });
  };

  const handleUpdateSex = (id: string, input: UpsertSexInput) => {
    updateSex({ path: `/sexes/${id}`, body: input });
  };

  const handleDeleteSex = (sexToDelete: SexExtended) => {
    deleteSex({ path: `/sexes/${sexToDelete.id}` });
  };

  return (
    <>
      <ManageTopBar title={t("genders")} onClickCreate={handleCreateClick} onClickExport={handleExportClick} />
      <ContentContainerLayout>
        <SexeTable onClickUpdateSex={handleUpdateClick} onClickDeleteSex={setSexToDelete} />
      </ContentContainerLayout>
      <EntityUpsertDialog
        open={upsertSexDialog != null}
        onClose={() => setUpsertSexDialog(null)}
        title={
          upsertSexDialog?.mode === "create"
            ? t("sexCreationTitle")
            : upsertSexDialog?.mode === "update"
              ? t("sexEditionTitle")
              : undefined
        }
      >
        {upsertSexDialog?.mode === "create" && (
          <SexeCreate onCancel={() => setUpsertSexDialog(null)} onSubmit={handleCreateSex} />
        )}
        {upsertSexDialog?.mode === "update" && (
          <SexeUpdate sex={upsertSexDialog.sex} onCancel={() => setUpsertSexDialog(null)} onSubmit={handleUpdateSex} />
        )}
      </EntityUpsertDialog>
      <SexeDeleteDialog
        sexToDelete={sexToDelete}
        onCancelDeletion={() => setSexToDelete(null)}
        onConfirmDeletion={handleDeleteSex}
      />
    </>
  );
};

export default SexePage;
