import { getNumberEstimatesExtendedResponse, type NumberEstimatesOrderBy } from "@ou-ca/common/api/number-estimate";
import { type NumberEstimateExtended } from "@ou-ca/common/entities/number-estimate";
import { useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useApiMutation from "../../../hooks/api/useApiMutation";
import useApiQuery from "../../../hooks/api/useApiQuery";
import usePaginatedTableParams from "../../../hooks/usePaginatedTableParams";
import useSnackbar from "../../../hooks/useSnackbar";
import Table from "../../common/styled/table/Table";
import TableSortLabel from "../../common/styled/table/TableSortLabel";
import DeletionConfirmationDialog from "../common/DeletionConfirmationDialog";
import ManageEntitiesHeader from "../common/ManageEntitiesHeader";
import TableCellActionButtons from "../common/TableCellActionButtons";

const COLUMNS = [
  {
    key: "libelle",
    locKey: "label",
  },
  {
    key: "nonCompte",
    locKey: "undefinedNumber",
  },
  {
    key: "nbDonnees",
    locKey: "numberOfObservations",
  },
] as const;

const EstimationNombreTable: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { query, setQuery, page, setPage, rowsPerPage, orderBy, setOrderBy, sortOrder, setSortOrder } =
    usePaginatedTableParams<NumberEstimatesOrderBy>();

  const [dialogEstimationNombre, setDialogEstimationNombre] = useState<NumberEstimateExtended | null>(null);

  const { data, refetch } = useApiQuery(
    {
      path: "/number-estimates",
      queryParams: {
        q: query,
        pageNumber: page,
        pageSize: rowsPerPage,
        orderBy,
        sortOrder,
        extended: true,
      },
      schema: getNumberEstimatesExtendedResponse,
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

  const handleEditEstimationNombre = (id: string) => {
    if (id) {
      navigate(`edit/${id}`);
    }
  };

  const handleDeleteEstimationNombre = (estimationNombre: NumberEstimateExtended | null) => {
    if (estimationNombre) {
      setDialogEstimationNombre(estimationNombre);
    }
  };

  const handleDeleteEstimationNombreConfirmation = (estimationNombre: NumberEstimateExtended | null) => {
    if (estimationNombre) {
      setDialogEstimationNombre(null);
      mutate({ path: `/number-estimates/${estimationNombre.id}` });
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRequestSort = (sortingColumn: NumberEstimatesOrderBy) => {
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
        tableRows={data?.data.map((estimationNombre) => {
          return (
            <tr className="hover:bg-base-200" key={estimationNombre?.id}>
              <td>{estimationNombre.libelle}</td>
              <td>{estimationNombre.nonCompte ? "Oui" : ""}</td>
              <td>{estimationNombre.entriesCount}</td>
              <td align="right" className="pr-6">
                <TableCellActionButtons
                  disabled={!estimationNombre.editable}
                  onEditClicked={() => handleEditEstimationNombre(estimationNombre?.id)}
                  onDeleteClicked={() => handleDeleteEstimationNombre(estimationNombre)}
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
        open={!!dialogEstimationNombre}
        messageContent={t("deleteNumberPrecisionDialogMsg", {
          name: dialogEstimationNombre?.libelle,
        })}
        impactedItemsMessage={t("deleteNumberPrecisionDialogMsgImpactedData", {
          nbOfObservations: dialogEstimationNombre?.entriesCount ?? 0,
        })}
        onCancelAction={() => setDialogEstimationNombre(null)}
        onConfirmAction={() => handleDeleteEstimationNombreConfirmation(dialogEstimationNombre)}
      />
    </>
  );
};

export default EstimationNombreTable;
