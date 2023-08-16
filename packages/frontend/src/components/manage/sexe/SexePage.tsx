import { type SexExtended } from "@ou-ca/common/entities/sex";
import { useQueryClient } from "@tanstack/react-query";
import { useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useApiExportEntities from "../../../hooks/api/useApiExportEntities";
import useApiMutation from "../../../hooks/api/useApiMutation";
import useSnackbar from "../../../hooks/useSnackbar";
import ContentContainerLayout from "../../layout/ContentContainerLayout";
import ManageTopBar from "../common/ManageTopBar";
import SexeDeleteDialog from "./SexeDeleteDialog";
import SexeTable from "./SexeTable";

const SexePage: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const { displayNotification } = useSnackbar();

  const [sexToDelete, setSexToDelete] = useState<SexExtended | null>(null);

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
    }
  );

  const { mutate: generateExport } = useApiExportEntities({ filename: t("genders") });

  const handleUpdateClick = (id: string) => {
    navigate(`edit/${id}`);
  };

  const handleExportClick = () => {
    generateExport({ path: "/generate-export/sexes" });
  };

  const handleDeleteSex = (sexToDelete: SexExtended) => {
    deleteSex({ path: `/sexes/${sexToDelete.id}` });
  };

  return (
    <>
      <ManageTopBar title={t("genders")} onClickExport={handleExportClick} />
      <ContentContainerLayout>
        <SexeTable onClickUpdateSex={handleUpdateClick} />
      </ContentContainerLayout>
      <SexeDeleteDialog
        sexToDelete={sexToDelete}
        onCancelDeletion={() => setSexToDelete(null)}
        onConfirmDeletion={handleDeleteSex}
      />
    </>
  );
};

export default SexePage;
