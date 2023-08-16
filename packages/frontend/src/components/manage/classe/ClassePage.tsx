import { type SpeciesClassExtended } from "@ou-ca/common/entities/species-class";
import { useQueryClient } from "@tanstack/react-query";
import { useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useApiExportEntities from "../../../hooks/api/useApiExportEntities";
import useApiMutation from "../../../hooks/api/useApiMutation";
import useSnackbar from "../../../hooks/useSnackbar";
import ContentContainerLayout from "../../layout/ContentContainerLayout";
import ManageTopBar from "../common/ManageTopBar";
import ClasseDeleteDialog from "./ClasseDeleteDialog";
import ClasseTable from "./ClasseTable";

const ClassePage: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const { displayNotification } = useSnackbar();

  const [speciesClassToDelete, setSpeciesClassToDelete] = useState<SpeciesClassExtended | null>(null);

  const { mutate: deleteSpeciesClass } = useApiMutation(
    { method: "DELETE" },
    {
      onSettled: async () => {
        await queryClient.invalidateQueries(["API", "speciesClassTable"]);
      },
      onSuccess: () => {
        displayNotification({
          type: "success",
          message: t("deleteConfirmationMessage"),
        });
        setSpeciesClassToDelete(null);
      },
      onError: () => {
        displayNotification({
          type: "error",
          message: t("deleteErrorMessage"),
        });
      },
    }
  );

  const { mutate: generateExport } = useApiExportEntities({ filename: t("speciesClasses") });

  const handleUpdateClick = (id: string) => {
    navigate(`edit/${id}`);
  };

  const handleExportClick = () => {
    generateExport({ path: "/generate-export/classes" });
  };

  const handleDeleteSpeciesClass = (speciesClassToDelete: SpeciesClassExtended) => {
    deleteSpeciesClass({ path: `/classes/${speciesClassToDelete.id}` });
  };

  return (
    <>
      <ManageTopBar title={t("speciesClasses")} onClickExport={handleExportClick} />
      <ContentContainerLayout>
        <ClasseTable onClickUpdateSpeciesClass={handleUpdateClick} />
      </ContentContainerLayout>
      <ClasseDeleteDialog
        speciesClassToDelete={speciesClassToDelete}
        onCancelDeletion={() => setSpeciesClassToDelete(null)}
        onConfirmDeletion={handleDeleteSpeciesClass}
      />
    </>
  );
};

export default ClassePage;
