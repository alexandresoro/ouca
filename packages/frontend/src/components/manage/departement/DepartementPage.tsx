import { upsertDepartmentResponse } from "@ou-ca/common/api/department";
import { type DepartmentExtended } from "@ou-ca/common/entities/department";
import { useQueryClient } from "@tanstack/react-query";
import { useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useApiExportEntities from "../../../hooks/api/useApiExportEntities";
import useApiMutation from "../../../hooks/api/useApiMutation";
import useSnackbar from "../../../hooks/useSnackbar";
import ContentContainerLayout from "../../layout/ContentContainerLayout";
import ManageTopBar from "../common/ManageTopBar";
import DepartementDeleteDialog from "./DepartementDeleteDialog";
import DepartementTable from "./DepartementTable";

const DepartementPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const { displayNotification } = useSnackbar();

  const [upsertDepartmentDialog, setUpsertDepartmentDialog] = useState<
    null | { mode: "create" } | { mode: "update"; id: string }
  >(null);
  const [departmentToDelete, setDepartmentToDelete] = useState<DepartmentExtended | null>(null);

  const { mutate: createDepartment } = useApiMutation(
    {
      path: "/departments",
      method: "POST",
      schema: upsertDepartmentResponse,
    },
    {
      onSettled: async () => {
        await queryClient.invalidateQueries(["API", "departmentTable"]);
      },
      onSuccess: () => {
        displayNotification({
          type: "success",
          message: t("retrieveGenericSaveSuccess"),
        });
        setUpsertDepartmentDialog(null);
      },
      onError: (e) => {
        if (e.status === 409) {
          displayNotification({
            type: "error",
            message: t("departmentAlreadyExistingError"),
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

  const { mutate: updateDepartment } = useApiMutation(
    {
      method: "PUT",
      schema: upsertDepartmentResponse,
    },
    {
      onSettled: async () => {
        await queryClient.invalidateQueries(["API", "departmentTable"]);
      },
      onSuccess: () => {
        displayNotification({
          type: "success",
          message: t("retrieveGenericSaveSuccess"),
        });
        setUpsertDepartmentDialog(null);
      },
      onError: (e) => {
        if (e.status === 409) {
          displayNotification({
            type: "error",
            message: t("departmentAlreadyExistingError"),
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

  const { mutate: deleteDepartment } = useApiMutation(
    { method: "DELETE" },
    {
      onSettled: async () => {
        await queryClient.invalidateQueries(["API", "departmentTable"]);
      },
      onSuccess: () => {
        displayNotification({
          type: "success",
          message: t("deleteConfirmationMessage"),
        });
        setDepartmentToDelete(null);
      },
      onError: () => {
        displayNotification({
          type: "error",
          message: t("deleteErrorMessage"),
        });
      },
    }
  );

  const { mutate: generateExport } = useApiExportEntities({ filename: t("departments") });

  const handleCreateClick = () => {
    setUpsertDepartmentDialog({ mode: "create" });
  };

  const handleUpdateClick = (id: string) => {
    setUpsertDepartmentDialog({ mode: "update", id });
    navigate(`edit/${id}`);
  };

  const handleExportClick = () => {
    generateExport({ path: "/generate-export/departments" });
  };

  const handleDeleteDepartment = (departmentToDelete: DepartmentExtended) => {
    deleteDepartment({ path: `/departments/${departmentToDelete.id}` });
  };

  return (
    <>
      <ManageTopBar title={t("departments")} onClickExport={handleExportClick} />
      <ContentContainerLayout>
        <DepartementTable onClickUpdateDepartment={handleUpdateClick} onClickDeleteDepartment={setDepartmentToDelete} />
      </ContentContainerLayout>
      <DepartementDeleteDialog
        departmentToDelete={departmentToDelete}
        onCancelDeletion={() => setDepartmentToDelete(null)}
        onConfirmDeletion={handleDeleteDepartment}
      />
    </>
  );
};

export default DepartementPage;
