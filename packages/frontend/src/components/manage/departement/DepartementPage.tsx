import { type DepartmentExtended } from "@ou-ca/common/entities/department";
import { useQueryClient } from "@tanstack/react-query";
import { useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useApiExportEntities from "../../../hooks/api/useApiExportEntities";
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

  const [departmentToDelete, setDepartmentToDelete] = useState<DepartmentExtended | null>(null);

  const { mutate: generateExport } = useApiExportEntities({ filename: t("departments") });

  const handleUpdateClick = (id: string) => {
    navigate(`edit/${id}`);
  };

  const handleExportClick = () => {
    generateExport({ path: "/generate-export/departments" });
  };

  const handleDeleteDepartment = (departmentToDelete: DepartmentExtended) => {};

  return (
    <>
      <ManageTopBar title={t("departments")} onClickExport={handleExportClick} />
      <ContentContainerLayout>
        <DepartementTable onClickUpdateDepartment={handleUpdateClick} />
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
