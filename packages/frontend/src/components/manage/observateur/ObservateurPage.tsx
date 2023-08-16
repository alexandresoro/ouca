import { type ObserverExtended } from "@ou-ca/common/entities/observer";
import { useQueryClient } from "@tanstack/react-query";
import { useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useApiExportEntities from "../../../hooks/api/useApiExportEntities";
import useApiMutation from "../../../hooks/api/useApiMutation";
import useSnackbar from "../../../hooks/useSnackbar";
import ContentContainerLayout from "../../layout/ContentContainerLayout";
import ManageTopBar from "../common/ManageTopBar";
import ObservateurDeleteDialog from "./ObservateurDeleteDialog";
import ObservateurTable from "./ObservateurTable";

const ObservateurPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const { displayNotification } = useSnackbar();

  const [observerToDelete, setObserverToDelete] = useState<ObserverExtended | null>(null);

  const { mutate: deleteObserver } = useApiMutation(
    { method: "DELETE" },
    {
      onSettled: async () => {
        await queryClient.invalidateQueries(["API", "observerTable"]);
      },
      onSuccess: () => {
        displayNotification({
          type: "success",
          message: t("deleteConfirmationMessage"),
        });
      },
      onError: () => {
        displayNotification({
          type: "error",
          message: t("deleteErrorMessage"),
        });
      },
    }
  );

  const { mutate: generateExport } = useApiExportEntities({ filename: t("observer") });

  const handleUpdateClick = (id: string) => {
    navigate(`edit/${id}`);
  };

  const handleExportClick = () => {
    generateExport({ path: "/generate-export/observers" });
  };

  const handleDeleteObserver = (observerToDelete: ObserverExtended) => {};

  return (
    <>
      <ManageTopBar title={t("observers")} onClickExport={handleExportClick} />
      <ContentContainerLayout>
        <ObservateurTable onClickUpdateObserver={handleUpdateClick} />
      </ContentContainerLayout>
      <ObservateurDeleteDialog
        observerToDelete={observerToDelete}
        onCancelDeletion={() => setObserverToDelete(null)}
        onConfirmDeletion={handleDeleteObserver}
      />
    </>
  );
};

export default ObservateurPage;
