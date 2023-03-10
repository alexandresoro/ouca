import { useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "urql";
import { graphql } from "../../../gql";
import { type EstimationNombre, type EstimationNombreOrderBy } from "../../../gql/graphql";
import usePaginatedTableParams from "../../../hooks/usePaginatedTableParams";
import useSnackbar from "../../../hooks/useSnackbar";
import Table from "../../common/styled/table/Table";
import TableSortLabel from "../../common/styled/table/TableSortLabel";
import DeletionConfirmationDialog from "../common/DeletionConfirmationDialog";
import ManageEntitiesHeader from "../common/ManageEntitiesHeader";
import TableCellActionButtons from "../common/TableCellActionButtons";

const PAGINATED_QUERY = graphql(`
  query EstimationsNombreTable($searchParams: SearchParams, $orderBy: EstimationNombreOrderBy, $sortOrder: SortOrder) {
    estimationsNombre(searchParams: $searchParams, orderBy: $orderBy, sortOrder: $sortOrder) {
      count
      data {
        id
        libelle
        editable
        nbDonnees
        nonCompte
      }
    }
  }
`);

const DELETE = graphql(`
  mutation DeleteEstimationNombre($id: Int!) {
    deleteEstimationNombre(id: $id)
  }
`);

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
    query: PAGINATED_QUERY,
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

  const [_, deleteEstimationNombre] = useMutation(DELETE);

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
      deleteEstimationNombre({
        id: estimationNombre.id,
      })
        .then(({ data, error }) => {
          reexecuteEstimationsNombre();
          if (!error && data?.deleteEstimationNombre) {
            displayNotification({
              type: "success",
              message: t("deleteConfirmationMessage"),
            });
          } else {
            displayNotification({
              type: "error",
              message: t("deleteErrorMessage"),
            });
          }
        })
        .catch(() => {
          displayNotification({
            type: "error",
            message: t("deleteErrorMessage"),
          });
        });
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
            <th align="right">{t("actions")}</th>
          </>
        }
        tableRows={data?.estimationsNombre?.data?.map((estimationNombre) => {
          return (
            <tr className="hover" key={estimationNombre?.id}>
              <td>{estimationNombre?.libelle}</td>
              <td>{estimationNombre?.nonCompte ? "Oui" : ""}</td>
              <td>{estimationNombre?.nbDonnees}</td>
              <td align="right">
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
      ></Table>
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
