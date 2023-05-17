import { useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useQuery } from "urql";
import { type EstimationNombre, type EstimationNombreOrderBy } from "../../../gql/graphql";
import useApiMutation from "../../../hooks/api/useApiMutation";
import usePaginatedTableParams from "../../../hooks/usePaginatedTableParams";
import useSnackbar from "../../../hooks/useSnackbar";
import Table from "../../common/styled/table/Table";
import TableSortLabel from "../../common/styled/table/TableSortLabel";
import DeletionConfirmationDialog from "../common/DeletionConfirmationDialog";
import ManageEntitiesHeader from "../common/ManageEntitiesHeader";
import TableCellActionButtons from "../common/TableCellActionButtons";
import { PAGINATED_ESTIMATIONS_NOMBRE_QUERY } from "./EstimationNombreManageQueries";

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
    usePaginatedTableParams<EstimationNombreOrderBy>();

  const [dialogEstimationNombre, setDialogEstimationNombre] = useState<EstimationNombre | null>(null);

  const [{ data }, reexecuteEstimationsNombre] = useQuery({
    query: PAGINATED_ESTIMATIONS_NOMBRE_QUERY,
    variables: {
      searchParams: {
        pageNumber: page,
        pageSize: rowsPerPage,
        q: query,
      },
      orderBy,
      sortOrder,
    },
  });

  const { mutate } = useApiMutation(
    { method: "DELETE" },
    {
      onSettled: () => {
        reexecuteEstimationsNombre();
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

  const handleEditEstimationNombre = (id: number | undefined) => {
    if (id) {
      navigate(`edit/${id}`);
    }
  };

  const handleDeleteEstimationNombre = (estimationNombre: EstimationNombre | null) => {
    if (estimationNombre) {
      setDialogEstimationNombre(estimationNombre);
    }
  };

  const handleDeleteEstimationNombreConfirmation = (estimationNombre: EstimationNombre | null) => {
    if (estimationNombre) {
      setDialogEstimationNombre(null);
      mutate({ path: `/number-estimates/${estimationNombre.id}` });
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRequestSort = (sortingColumn: EstimationNombreOrderBy) => {
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
        count={data?.estimationsNombre?.count}
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
        tableRows={data?.estimationsNombre?.data?.map((estimationNombre) => {
          return (
            <tr className="hover" key={estimationNombre?.id}>
              <td>{estimationNombre?.libelle}</td>
              <td>{estimationNombre?.nonCompte ? "Oui" : ""}</td>
              <td>{estimationNombre?.nbDonnees}</td>
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
        count={data?.estimationsNombre?.count ?? 0}
        onPageChange={handleChangePage}
      />
      <DeletionConfirmationDialog
        open={!!dialogEstimationNombre}
        messageContent={t("deleteNumberPrecisionDialogMsg", {
          name: dialogEstimationNombre?.libelle,
        })}
        impactedItemsMessage={t("deleteNumberPrecisionDialogMsgImpactedData", {
          nbOfObservations: dialogEstimationNombre?.nbDonnees ?? 0,
        })}
        onCancelAction={() => setDialogEstimationNombre(null)}
        onConfirmAction={() => handleDeleteEstimationNombreConfirmation(dialogEstimationNombre)}
      />
    </>
  );
};

export default EstimationNombreTable;
