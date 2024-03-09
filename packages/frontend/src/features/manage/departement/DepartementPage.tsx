import { type UpsertDepartmentInput, upsertDepartmentResponse } from "@ou-ca/common/api/department";
import { type Department, type DepartmentExtended } from "@ou-ca/common/api/entities/department";
import { useQueryClient } from "@tanstack/react-query";
import { type FunctionComponent, useState } from "react";
import { useTranslation } from "react-i18next";
import useApiMutation from "../../../hooks/api/useApiMutation";
import useSnackbar from "../../../hooks/useSnackbar";
import ContentContainerLayout from "../../../layouts/ContentContainerLayout";
import useApiExportEntities from "../../../services/api/export/useApiExportEntities";
import EntityUpsertDialog from "../common/EntityUpsertDialog";
import ManageTopBar from "../common/ManageTopBar";
import DepartementCreate from "./DepartementCreate";
import DepartementDeleteDialog from "./DepartementDeleteDialog";
import DepartementTable from "./DepartementTable";
import DepartementUpdate from "./DepartementUpdate";

const DepartementPage: FunctionComponent = () => {
  const { t } = useTranslation();

  const queryClient = useQueryClient();

  const { displayNotification } = useSnackbar();

  const [upsertDepartmentDialog, setUpsertDepartmentDialog] = useState<
    null | { mode: "create" } | { mode: "update"; department: Department }
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
    },
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
    },
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
    },
  );

  const { mutate: generateExport } = useApiExportEntities({ filename: t("departments") });

  const handleCreateClick = () => {
    setUpsertDepartmentDialog({ mode: "create" });
  };

  const handleUpdateClick = (department: Department) => {
    setUpsertDepartmentDialog({ mode: "update", department });
  };

  const handleExportClick = () => {
    generateExport({ path: "/generate-export/departments" });
  };

  const handleCreateDepartment = (input: UpsertDepartmentInput) => {
    createDepartment({ body: input });
  };

  const handleUpdateDepartment = (id: string, input: UpsertDepartmentInput) => {
    updateDepartment({ path: `/departments/${id}`, body: input });
  };

  const handleDeleteDepartment = (departmentToDelete: DepartmentExtended) => {
    deleteDepartment({ path: `/departments/${departmentToDelete.id}` });
  };

  return (
    <>
      <ManageTopBar title={t("departments")} onClickCreate={handleCreateClick} onClickExport={handleExportClick} />
      <ContentContainerLayout>
        <DepartementTable onClickUpdateDepartment={handleUpdateClick} onClickDeleteDepartment={setDepartmentToDelete} />
      </ContentContainerLayout>
      <EntityUpsertDialog
        open={upsertDepartmentDialog != null}
        onClose={() => setUpsertDepartmentDialog(null)}
        title={
          upsertDepartmentDialog?.mode === "create"
            ? t("departmentCreationTitle")
            : upsertDepartmentDialog?.mode === "update"
              ? t("departmentEditionTitle")
              : undefined
        }
      >
        {upsertDepartmentDialog?.mode === "create" && (
          <DepartementCreate onCancel={() => setUpsertDepartmentDialog(null)} onSubmit={handleCreateDepartment} />
        )}
        {upsertDepartmentDialog?.mode === "update" && (
          <DepartementUpdate
            department={upsertDepartmentDialog.department}
            onCancel={() => setUpsertDepartmentDialog(null)}
            onSubmit={handleUpdateDepartment}
          />
        )}
      </EntityUpsertDialog>
      <DepartementDeleteDialog
        departmentToDelete={departmentToDelete}
        onCancelDeletion={() => setDepartmentToDelete(null)}
        onConfirmDeletion={handleDeleteDepartment}
      />
    </>
  );
};

export default DepartementPage;
