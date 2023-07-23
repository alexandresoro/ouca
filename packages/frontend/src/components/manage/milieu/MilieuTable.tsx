import { getEnvironmentsExtendedResponse, type EnvironmentsOrderBy } from "@ou-ca/common/api/environment";
import { type Environment } from "@ou-ca/common/entities/environment";
import { useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useApiMutation from "../../../hooks/api/useApiMutation";
import useApiQuery from "../../../hooks/api/useApiQuery";
import { usePaginatedTableParams_legacy } from "../../../hooks/usePaginationParams";
import useSnackbar from "../../../hooks/useSnackbar";
import Table from "../../common/styled/table/Table";
import TableSortLabel from "../../common/styled/table/TableSortLabel";
import DeletionConfirmationDialog from "../common/DeletionConfirmationDialog";
import ManageEntitiesHeader from "../common/ManageEntitiesHeader";
import TableCellActionButtons from "../common/TableCellActionButtons";

const COLUMNS = [
  {
    key: "code",
    locKey: "code",
  },
  {
    key: "libelle",
    locKey: "label",
  },
  {
    key: "nbDonnees",
    locKey: "numberOfObservations",
  },
] as const;

const MilieuTable: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { query, setQuery, page, setPage, rowsPerPage, orderBy, setOrderBy, sortOrder, setSortOrder } =
    usePaginatedTableParams_legacy<EnvironmentsOrderBy>();

  const [dialogMilieu, setDialogMilieu] = useState<Environment | null>(null);

  const { data, refetch } = useApiQuery(
    {
      path: "/environments",
      queryParams: {
        q: query,
        pageNumber: page,
        pageSize: rowsPerPage,
        orderBy,
        sortOrder,
        extended: true,
      },
      schema: getEnvironmentsExtendedResponse,
    },
    {
      staleTime: Infinity,
      refetchOnMount: "always",
    }
  );

  const { mutate } = useApiMutation(
    { method: "DELETE" },
    {
      onSettled: async () => {
        await refetch();
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

  const { displayNotification } = useSnackbar();

  const handleEditMilieu = (id: string) => {
    if (id) {
      navigate(`edit/${id}`);
    }
  };

  const handleDeleteMilieu = (milieu: Environment | null) => {
    if (milieu) {
      setDialogMilieu(milieu);
    }
  };

  const handleDeleteMilieuConfirmation = (milieu: Environment | null) => {
    if (milieu) {
      setDialogMilieu(null);
      mutate({ path: `/environments/${milieu.id}` });
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRequestSort = (sortingColumn: EnvironmentsOrderBy) => {
    const isAsc = orderBy === sortingColumn && sortOrder === "asc";
    setSortOrder(isAsc ? "desc" : "asc");
    setOrderBy(sortingColumn);
  };

  return (
    <>
      <ManageEntitiesHeader
        value={query}
        onChange={(e) => {
          setQuery(e.currentTarget.value);
        }}
        count={data?.meta.count}
      />
      <Table
        tableHead={
          <>
            {COLUMNS.map((column) => (
              <th key={column.key}>
                <TableSortLabel
                  active={orderBy === column.key}
                  direction={orderBy === column.key ? sortOrder : "asc"}
                  onClick={() => handleRequestSort(column.key)}
                >
                  {t(column.locKey)}
                </TableSortLabel>
              </th>
            ))}
            <th align="right" className="pr-8">
              {t("actions")}
            </th>
          </>
        }
        tableRows={data?.data.map((milieu) => {
          return (
            <tr className="hover:bg-base-200" key={milieu?.id}>
              <td>{milieu.code}</td>
              <td>{milieu.libelle}</td>
              <td>{milieu.entriesCount}</td>
              <td align="right" className="pr-6">
                <TableCellActionButtons
                  disabled={!milieu.editable}
                  onEditClicked={() => handleEditMilieu(milieu?.id)}
                  onDeleteClicked={() => handleDeleteMilieu(milieu)}
                />
              </td>
            </tr>
          );
        })}
        page={page}
        elementsPerPage={rowsPerPage}
        count={data?.meta.count ?? 0}
        onPageChange={handleChangePage}
      />
      <DeletionConfirmationDialog
        open={!!dialogMilieu}
        messageContent={t("deleteEnvironmentDialogMsg", {
          name: dialogMilieu?.libelle,
        })}
        impactedItemsMessage={t("deleteEnvironmentDialogMsgImpactedData")}
        onCancelAction={() => setDialogMilieu(null)}
        onConfirmAction={() => handleDeleteMilieuConfirmation(dialogMilieu)}
      />
    </>
  );
};

export default MilieuTable;
