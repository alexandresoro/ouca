import { useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "urql";
import { graphql } from "../../../gql";
import { type EntitesAvecLibelleOrderBy, type EstimationDistance } from "../../../gql/graphql";
import usePaginatedTableParams from "../../../hooks/usePaginatedTableParams";
import useSnackbar from "../../../hooks/useSnackbar";
import Table from "../../common/styled/table/Table";
import TableSortLabel from "../../common/styled/table/TableSortLabel";
import DeletionConfirmationDialog from "../common/DeletionConfirmationDialog";
import ManageEntitiesHeader from "../common/ManageEntitiesHeader";
import TableCellActionButtons from "../common/TableCellActionButtons";

const PAGINATED_QUERY = graphql(`
  query EstimationsDistanceTable(
    $searchParams: SearchParams
    $orderBy: EntitesAvecLibelleOrderBy
    $sortOrder: SortOrder
  ) {
    estimationsDistance(searchParams: $searchParams, orderBy: $orderBy, sortOrder: $sortOrder) {
      count
      data {
        id
        libelle
        editable
        nbDonnees
      }
    }
  }
`);

const DELETE = graphql(`
  mutation DeleteEstimationDistance($id: Int!) {
    deleteEstimationDistance(id: $id)
  }
`);

const COLUMNS = [
  {
    key: "libelle",
    locKey: "label",
  },
  {
    key: "nbDonnees",
    locKey: "numberOfObservations",
  },
] as const;

const EstimationDistanceTable: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { query, setQuery, page, setPage, rowsPerPage, orderBy, setOrderBy, sortOrder, setSortOrder } =
    usePaginatedTableParams<EntitesAvecLibelleOrderBy>();

  const [dialogEstimationDistance, setDialogEstimationDistance] = useState<EstimationDistance | null>(null);

  const [{ data }, reexecutEstimationsDistance] = useQuery({
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

  const [_, deleteEstimationDistance] = useMutation(DELETE);

  const { displayNotification } = useSnackbar();

  const handleEditEstimationDistance = (id: number | undefined) => {
    if (id) {
      navigate(`edit/${id}`);
    }
  };

  const handleDeleteEstimationDistance = (estimationDistance: EstimationDistance | null) => {
    if (estimationDistance) {
      setDialogEstimationDistance(estimationDistance);
    }
  };

  const handleDeleteEstimationDistanceConfirmation = (estimationDistance: EstimationDistance | null) => {
    if (estimationDistance) {
      setDialogEstimationDistance(null);
      deleteEstimationDistance({
        id: estimationDistance.id,
      })
        .then(({ data, error }) => {
          reexecutEstimationsDistance();
          if (!error && data?.deleteEstimationDistance) {
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

  const handleRequestSort = (sortingColumn: EntitesAvecLibelleOrderBy) => {
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
        count={data?.estimationsDistance?.count}
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
              <th align="right" className="pr-8">{t("actions")}</th>
            </>}
            tableRows={data?.estimationsDistance?.data?.map((estimationDistance) => {
              return (
                <tr className="hover" key={estimationDistance?.id}>
                  <td>{estimationDistance?.libelle}</td>
                  <td>{estimationDistance?.nbDonnees}</td>
                  <td align="right" className="pr-6">
                    <TableCellActionButtons
                      disabled={!estimationDistance.editable}
                      onEditClicked={() => handleEditEstimationDistance(estimationDistance?.id)}
                      onDeleteClicked={() => handleDeleteEstimationDistance(estimationDistance)}
                    />
                  </td>
                </tr>
              );
            })}
            page={page}
            elementsPerPage={rowsPerPage}
            count={data?.estimationsDistance?.count ?? 0}
            onPageChange={handleChangePage}
          ></Table>
      <DeletionConfirmationDialog
        open={!!dialogEstimationDistance}
        messageContent={t("deleteDistancePrecisionDialogMsg", {
          name: dialogEstimationDistance?.libelle,
        })}
        impactedItemsMessage={t("deleteDistancePrecisionDialogMsgImpactedData", {
          nbOfObservations: dialogEstimationDistance?.nbDonnees,
        })}
        onCancelAction={() => setDialogEstimationDistance(null)}
        onConfirmAction={() => handleDeleteEstimationDistanceConfirmation(dialogEstimationDistance)}
      />
    </>
  );
};

export default EstimationDistanceTable;
