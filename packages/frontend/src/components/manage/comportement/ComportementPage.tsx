import { type BehaviorExtended } from "@ou-ca/common/entities/behavior";
import { useQueryClient } from "@tanstack/react-query";
import { useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useApiExportEntities from "../../../hooks/api/useApiExportEntities";
import useApiMutation from "../../../hooks/api/useApiMutation";
import useSnackbar from "../../../hooks/useSnackbar";
import ContentContainerLayout from "../../layout/ContentContainerLayout";
import ManageTopBar from "../common/ManageTopBar";
import ComportementDeleteDialog from "./ComportementDeleteDialog";
import ComportementTable from "./ComportementTable";

const ComportementPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const { displayNotification } = useSnackbar();

  const [behaviorToDelete, setBehaviorToDelete] = useState<BehaviorExtended | null>(null);

  const { mutate: deleteBehavior } = useApiMutation(
    { method: "DELETE" },
    {
      onSettled: async () => {
        await queryClient.invalidateQueries(["API", "behaviorTable"]);
      },
      onSuccess: () => {
        displayNotification({
          type: "success",
          message: t("deleteConfirmationMessage"),
        });
        setBehaviorToDelete(null);
      },
      onError: () => {
        displayNotification({
          type: "error",
          message: t("deleteErrorMessage"),
        });
      },
    }
  );

  const { mutate: generateExport } = useApiExportEntities({ filename: t("behaviors") });

  const handleUpdateClick = (id: string) => {
    navigate(`edit/${id}`);
  };

  const handleExportClick = () => {
    generateExport({ path: "/generate-export/behaviors" });
  };

  const handleDeleteBehavior = (behaviorToDelete: BehaviorExtended) => {
    deleteBehavior({ path: `/behaviors/${behaviorToDelete.id}` });
  };

  return (
    <>
      <ManageTopBar title={t("behaviors")} onClickExport={handleExportClick} />
      <ContentContainerLayout>
        <ComportementTable onClickUpdateBehavior={handleUpdateClick} onClickDeleteBehavior={setBehaviorToDelete} />
      </ContentContainerLayout>
      <ComportementDeleteDialog
        behaviorToDelete={behaviorToDelete}
        onCancelDeletion={() => setBehaviorToDelete(null)}
        onConfirmDeletion={handleDeleteBehavior}
      />
    </>
  );
};

export default ComportementPage;
