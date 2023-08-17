import { upsertLocalityResponse, type UpsertLocalityInput } from "@ou-ca/common/api/locality";
import { type LocalityExtended } from "@ou-ca/common/entities/locality";
import { useQueryClient } from "@tanstack/react-query";
import { useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useApiExportEntities from "../../../hooks/api/useApiExportEntities";
import useApiMutation from "../../../hooks/api/useApiMutation";
import useSnackbar from "../../../hooks/useSnackbar";
import ContentContainerLayout from "../../layout/ContentContainerLayout";
import EntityUpsertDialog from "../common/EntityUpsertDialog";
import ManageTopBar from "../common/ManageTopBar";
import LieuDitCreate from "./LieuDitCreate";
import LieuDitDeleteDialog from "./LieuDitDeleteDialog";
import LieuDitTable from "./LieuDitTable";
import LieuDitUpdate from "./LieuDitUpdate";

const LieuDitPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const { displayNotification } = useSnackbar();

  const [upsertLocalityDialog, setUpsertLocalityDialog] = useState<
    null | { mode: "create" } | { mode: "update"; id: string }
  >(null);
  const [localityToDelete, setLocalityToDelete] = useState<LocalityExtended | null>(null);

  const { mutate: createLocality } = useApiMutation(
    {
      path: "/localities",
      method: "POST",
      schema: upsertLocalityResponse,
    },
    {
      onSettled: async () => {
        await queryClient.invalidateQueries(["API", "localityTable"]);
      },
      onSuccess: () => {
        displayNotification({
          type: "success",
          message: t("retrieveGenericSaveSuccess"),
        });
        setUpsertLocalityDialog(null);
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

  const { mutate: updateLocality } = useApiMutation(
    {
      method: "PUT",
      schema: upsertLocalityResponse,
    },
    {
      onSettled: async () => {
        await queryClient.invalidateQueries(["API", "localityTable"]);
      },
      onSuccess: () => {
        displayNotification({
          type: "success",
          message: t("retrieveGenericSaveSuccess"),
        });
        setUpsertLocalityDialog(null);
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

  const { mutate: deleteLocality } = useApiMutation(
    { method: "DELETE" },
    {
      onSettled: async () => {
        await queryClient.invalidateQueries(["API", "localityTable"]);
      },
      onSuccess: () => {
        displayNotification({
          type: "success",
          message: t("deleteConfirmationMessage"),
        });
        setLocalityToDelete(null);
      },
      onError: () => {
        displayNotification({
          type: "error",
          message: t("deleteErrorMessage"),
        });
      },
    }
  );

  const { mutate: generateExport } = useApiExportEntities({ filename: t("localities") });

  const handleCreateClick = () => {
    setUpsertLocalityDialog({ mode: "create" });
  };

  const handleUpdateClick = (id: string) => {
    // setUpsertLocalityDialog({ mode: "update", id });
    navigate(`edit/${id}`);
  };

  const handleExportClick = () => {
    generateExport({ path: "/generate-export/localities" });
  };

  const handleCreateLocality = (input: UpsertLocalityInput) => {
    createLocality({ body: input });
  };

  const handleUpdateLocality = (id: string, input: UpsertLocalityInput) => {
    updateLocality({ path: `/localities/${id}`, body: input });
  };

  const handleDeleteLocality = (localityToDelete: LocalityExtended) => {
    deleteLocality({ path: `/localities/${localityToDelete.id}` });
  };

  return (
    <>
      <ManageTopBar title={t("localities")} onClickExport={handleExportClick} />
      <ContentContainerLayout>
        <LieuDitTable onClickUpdateLocality={handleUpdateClick} onClickDeleteLocality={setLocalityToDelete} />
      </ContentContainerLayout>
      <EntityUpsertDialog
        open={upsertLocalityDialog != null}
        onClose={() => setUpsertLocalityDialog(null)}
        title={
          upsertLocalityDialog?.mode === "create"
            ? t("localityCreationTitle")
            : upsertLocalityDialog?.mode === "update"
            ? t("localityEditionTitle")
            : undefined
        }
      >
        {upsertLocalityDialog?.mode === "create" && (
          <LieuDitCreate onCancel={() => setUpsertLocalityDialog(null)} onSubmit={handleCreateLocality} />
        )}
        {upsertLocalityDialog?.mode === "update" && (
          <LieuDitUpdate onCancel={() => setUpsertLocalityDialog(null)} onSubmit={handleUpdateLocality} />
        )}
      </EntityUpsertDialog>
      <LieuDitDeleteDialog
        localityToDelete={localityToDelete}
        onCancelDeletion={() => setLocalityToDelete(null)}
        onConfirmDeletion={handleDeleteLocality}
      />
    </>
  );
};

export default LieuDitPage;
