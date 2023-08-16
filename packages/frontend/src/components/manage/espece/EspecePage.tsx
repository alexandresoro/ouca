import { type SpeciesExtended } from "@ou-ca/common/entities/species";
import { useQueryClient } from "@tanstack/react-query";
import { useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useApiExportEntities from "../../../hooks/api/useApiExportEntities";
import useApiMutation from "../../../hooks/api/useApiMutation";
import useSnackbar from "../../../hooks/useSnackbar";
import ContentContainerLayout from "../../layout/ContentContainerLayout";
import ManageTopBar from "../common/ManageTopBar";
import EspeceDeleteDialog from "./EspeceDeleteDialog";
import EspeceTable from "./EspeceTable";

const EspecePage: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const { displayNotification } = useSnackbar();

  const [speciesToDelete, setSpeciesToDelete] = useState<SpeciesExtended | null>(null);

  const { mutate: deleteSpecies } = useApiMutation(
    { method: "DELETE" },
    {
      onSettled: async () => {
        await queryClient.invalidateQueries(["API", "speciesTable"]);
      },
      onSuccess: () => {
        displayNotification({
          type: "success",
          message: t("deleteConfirmationMessage"),
        });
        setSpeciesToDelete(null);
      },
      onError: () => {
        displayNotification({
          type: "error",
          message: t("deleteErrorMessage"),
        });
      },
    }
  );

  const { mutate: generateExport } = useApiExportEntities({ filename: t("species") });

  const handleUpdateClick = (id: string) => {
    navigate(`edit/${id}`);
  };

  const handleExportClick = () => {
    generateExport({ path: "/generate-export/species" });
  };

  const handleDeleteSpecies = (speciesToDelete: SpeciesExtended) => {
    deleteSpecies({ path: `/species/${speciesToDelete.id}` });
  };

  return (
    <>
      <ManageTopBar title={t("species")} onClickExport={handleExportClick} />
      <ContentContainerLayout>
        <EspeceTable onClickUpdateSpecies={handleUpdateClick} onClickDeleteSpecies={setSpeciesToDelete} />
      </ContentContainerLayout>
      <EspeceDeleteDialog
        speciesToDelete={speciesToDelete}
        onCancelDeletion={() => setSpeciesToDelete(null)}
        onConfirmDeletion={handleDeleteSpecies}
      />
    </>
  );
};

export default EspecePage;
