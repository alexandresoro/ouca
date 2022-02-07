import { gql, useMutation, useQuery } from "@apollo/client";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel
} from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import { FunctionComponent, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import usePaginatedTableParams from "../../../hooks/usePaginatedTableParams";
import useSnackbarContent from "../../../hooks/useSnackbarContent";
import {
  EntitesAvecLibelleOrderBy,
  EstimationDistanceWithCounts,
  EstimationsDistancePaginatedResult,
  MutationDeleteEstimationDistanceArgs,
  QueryPaginatedEstimationsDistanceArgs,
  SortOrder
} from "../../../model/graphql";
import NotificationSnackbar from "../../common/NotificationSnackbar";
import DeletionConfirmationDialog from "../common/DeletionConfirmationDialog";
import FilterTextField from "../common/FilterTextField";
import TableCellActionButtons from "../common/TableCellActionButtons";

type PaginatedEstimationsDistanceQueryResult = {
  paginatedEstimationsDistance: EstimationsDistancePaginatedResult;
};

type DeleteEstimationDistanceMutationResult = {
  deleteEstimationDistance: number | null;
};

const PAGINATED_QUERY = gql`
  query PaginatedEstimationsDistance(
    $searchParams: SearchParams
    $orderBy: EntitesAvecLibelleOrderBy
    $sortOrder: SortOrder
  ) {
    paginatedEstimationsDistance(searchParams: $searchParams, orderBy: $orderBy, sortOrder: $sortOrder) {
      count
      result {
        id
        libelle
        nbDonnees
      }
    }
  }
`;

const DELETE = gql`
  mutation DeleteEstimationDistance($id: Int!) {
    deleteEstimationDistance(id: $id)
  }
`;

const COLUMNS = [
  {
    key: "libelle",
    locKey: "label"
  },
  {
    key: "nbDonnees",
    locKey: "numberOfObservations"
  }
] as const;

const EstimationDistanceTable: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { query, setQuery, page, setPage, rowsPerPage, setRowsPerPage, orderBy, setOrderBy, sortOrder, setSortOrder } =
    usePaginatedTableParams<EntitesAvecLibelleOrderBy>();

  const [dialogEstimationDistance, setDialogEstimationDistance] = useState<EstimationDistanceWithCounts | null>(null);

  const { data } = useQuery<PaginatedEstimationsDistanceQueryResult, QueryPaginatedEstimationsDistanceArgs>(
    PAGINATED_QUERY,
    {
      fetchPolicy: "cache-and-network",
      variables: {
        searchParams: {
          pageNumber: page,
          pageSize: rowsPerPage,
          q: query
        },
        orderBy,
        sortOrder
      }
    }
  );

  const [deleteEstimationDistance] = useMutation<
    DeleteEstimationDistanceMutationResult,
    MutationDeleteEstimationDistanceArgs
  >(DELETE);

  const [snackbarContent, setSnackbarContent] = useSnackbarContent();

  const handleEditEstimationDistance = (id: number | undefined) => {
    if (id) {
      navigate(`edit/${id}`);
    }
  };

  const handleDeleteEstimationDistance = (estimationDistance: EstimationDistanceWithCounts | null) => {
    if (estimationDistance) {
      setDialogEstimationDistance(estimationDistance);
    }
  };

  const handleDeleteEstimationDistanceConfirmation = async (
    estimationDistance: EstimationDistanceWithCounts | null
  ) => {
    if (estimationDistance) {
      setDialogEstimationDistance(null);
      await deleteEstimationDistance({
        variables: {
          id: estimationDistance.id
        },
        refetchQueries: [PAGINATED_QUERY]
      })
        .then(({ data, errors }) => {
          if (!errors && data?.deleteEstimationDistance) {
            setSnackbarContent({
              type: "success",
              message: t("deleteConfirmationMessage")
            });
          }
        })
        .catch(() => {
          setSnackbarContent({
            type: "error",
            message: t("deleteErrorMessage")
          });
        });
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRequestSort = (sortingColumn: EntitesAvecLibelleOrderBy) => {
    const isAsc = orderBy === sortingColumn && sortOrder === "asc";
    setSortOrder(isAsc ? "desc" : "asc");
    setOrderBy(sortingColumn);
  };

  return (
    <>
      <FilterTextField
        value={query}
        onChange={(e) => {
          setQuery(e.currentTarget.value);
        }}
      />
      <TableContainer
        component={Paper}
        sx={{
          mt: 2
        }}
      >
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {COLUMNS.map((column) => (
                <TableCell key={column.key}>
                  <TableSortLabel
                    active={orderBy === column.key}
                    direction={orderBy === column.key ? sortOrder : "asc"}
                    onClick={() => handleRequestSort(column.key)}
                  >
                    {t(column.locKey)}
                    {orderBy === column.key ? (
                      <Box component="span" sx={visuallyHidden}>
                        {sortOrder === SortOrder.Desc ? t("aria-descendingSort") : t("aria-ascendingSort")}
                      </Box>
                    ) : null}
                  </TableSortLabel>
                </TableCell>
              ))}
              <TableCell align="right">{t("actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.paginatedEstimationsDistance?.result?.map((estimationDistance) => {
              return (
                <TableRow hover key={estimationDistance?.id}>
                  <TableCell>{estimationDistance?.libelle}</TableCell>
                  <TableCell>{estimationDistance?.nbDonnees}</TableCell>
                  <TableCell align="right">
                    <TableCellActionButtons
                      onEditClicked={() => handleEditEstimationDistance(estimationDistance?.id)}
                      onDeleteClicked={() => handleDeleteEstimationDistance(estimationDistance)}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[20, 50, 100]}
                count={data?.paginatedEstimationsDistance?.count ?? 0}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
      <DeletionConfirmationDialog
        open={!!dialogEstimationDistance}
        messageContent={t("deleteDistancePrecisionDialogMsg", {
          name: dialogEstimationDistance?.libelle
        })}
        impactedItemsMessage={t("deleteDistancePrecisionDialogMsgImpactedData", {
          nbOfObservations: dialogEstimationDistance?.nbDonnees
        })}
        onCancelAction={() => setDialogEstimationDistance(null)}
        onConfirmAction={() => handleDeleteEstimationDistanceConfirmation(dialogEstimationDistance)}
      />
      <NotificationSnackbar
        keyAlert={snackbarContent?.timestamp}
        type={snackbarContent.type}
        message={snackbarContent.message}
      />
    </>
  );
};

export default EstimationDistanceTable;
