import { useNotifications } from "@hooks/useNotifications";
import usePaginationParams from "@hooks/usePaginationParams";
import { useUser } from "@hooks/useUser";
import {
  type DepartmentsOrderBy,
  type UpsertDepartmentInput,
  upsertDepartmentResponse,
} from "@ou-ca/common/api/department";
import type { Department } from "@ou-ca/common/api/entities/department";
import { useApiDepartmentsInfiniteQuery } from "@services/api/department/api-department-queries";
import { useApiDownloadExport } from "@services/api/export/api-export-queries";
import { useQueryClient } from "@tanstack/react-query";
import { FetchError } from "@utils/fetch-api";
import { type FunctionComponent, useState } from "react";
import { useTranslation } from "react-i18next";
import useDeepCompareEffect from "use-deep-compare-effect";
import useApiMutation from "../../../hooks/api/useApiMutation";
import ContentContainerLayout from "../../../layouts/ContentContainerLayout";
import EntityUpsertDialog from "../common/EntityUpsertDialog";
import ManageTopBar from "../common/ManageTopBar";
import DepartementCreate from "./DepartementCreate";
import DepartementDeleteDialog from "./DepartementDeleteDialog";
import DepartementTable from "./DepartementTable";
import DepartementUpdate from "./DepartementUpdate";

const DepartementPage: FunctionComponent = () => {
  const { t } = useTranslation();

  const user = useUser();

  const queryClient = useQueryClient();

  const { displayNotification } = useNotifications();

  const [upsertDepartmentDialog, setUpsertDepartmentDialog] = useState<
    null | { mode: "create" } | { mode: "update"; department: Department }
  >(null);
  const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null);

  const { query, setQuery, orderBy, setOrderBy, sortOrder, setSortOrder } = usePaginationParams<DepartmentsOrderBy>({
    orderBy: "code",
  });

  const queryParams = {
    q: query,
    pageSize: 10,
    orderBy,
    sortOrder,
  };

  const { data, fetchNextPage, hasNextPage, mutate } = useApiDepartmentsInfiniteQuery(queryParams);

  // When query params change, we need to refetch the data
  useDeepCompareEffect(() => {
    void mutate();
  }, [queryParams, mutate]);

  const handleRequestSort = (sortingColumn: DepartmentsOrderBy) => {
    const isAsc = orderBy === sortingColumn && sortOrder === "asc";
    setSortOrder(isAsc ? "desc" : "asc");
    setOrderBy(sortingColumn);
  };

  const handleUpsertDepartmentError = (e: unknown) => {
    if (e instanceof FetchError && e.status === 409) {
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
  };

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

  const downloadExport = useApiDownloadExport({ filename: t("departments"), path: "/generate-export/departments" });

  const handleCreateClick = () => {
    setUpsertDepartmentDialog({ mode: "create" });
  };

  const handleUpdateClick = (department: Department) => {
    setUpsertDepartmentDialog({ mode: "update", department });
  };

  const handleExportClick = () => {
    void downloadExport();
  };

  const handleCreateDepartment = (input: UpsertDepartmentInput) => {
    createDepartment({ body: input });
  };

  const handleUpdateDepartment = (id: string, input: UpsertDepartmentInput) => {
    updateDepartment({ path: `/departments/${id}`, body: input });
  };

  const handleDeleteDepartment = (departmentToDelete: Department) => {
    deleteDepartment({ path: `/departments/${departmentToDelete.id}` });
  };

  return (
    <>
      <ManageTopBar
        title={t("departments")}
        enableCreate={user?.permissions.department.canCreate}
        onClickCreate={handleCreateClick}
        onClickExport={handleExportClick}
      />
      <ContentContainerLayout>
        <DepartementTable
          departments={data?.flatMap((page) => page.data)}
          onClickUpdateDepartment={handleUpdateClick}
          onClickDeleteDepartment={setDepartmentToDelete}
        />
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
