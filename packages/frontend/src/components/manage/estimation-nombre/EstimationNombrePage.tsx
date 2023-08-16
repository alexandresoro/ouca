import { type NumberEstimateExtended } from "@ou-ca/common/entities/number-estimate";
import { useQueryClient } from "@tanstack/react-query";
import { useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useApiExportEntities from "../../../hooks/api/useApiExportEntities";
import useApiMutation from "../../../hooks/api/useApiMutation";
import useSnackbar from "../../../hooks/useSnackbar";
import ContentContainerLayout from "../../layout/ContentContainerLayout";
import ManageTopBar from "../common/ManageTopBar";
import EstimationNombreDeleteDialog from "./EstimationNombreDeleteDialog";
import EstimationNombreTable from "./EstimationNombreTable";

const EstimationNombrePage: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const { displayNotification } = useSnackbar();

  const [numberEstimateToDelete, setNumberEstimateToDelete] = useState<NumberEstimateExtended | null>(null);

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
      },
      onError: () => {
        displayNotification({
          type: "error",
          message: t("deleteErrorMessage"),
        });
      },
    }
  );

  const { mutate: generateExport } = useApiExportEntities({ filename: t("numberPrecisions") });

  const handleUpdateClick = (id: string) => {
    navigate(`edit/${id}`);
  };

  const handleExportClick = () => {
    generateExport({ path: "/generate-export/number-estimates" });
  };

  const handleDeleteNumberEstimate = (numberEstimateToDelete: NumberEstimateExtended) => {};

  return (
    <>
      <ManageTopBar title={t("numberPrecisions")} onClickExport={handleExportClick} />
      <ContentContainerLayout>
        <EstimationNombreTable onClickUpdateNumberEstimate={handleUpdateClick} />
      </ContentContainerLayout>
      <EstimationNombreDeleteDialog
        numberEstimateToDelete={numberEstimateToDelete}
        onCancelDeletion={() => setNumberEstimateToDelete(null)}
        onConfirmDeletion={handleDeleteNumberEstimate}
      />
    </>
  );
};

export default EstimationNombrePage;
