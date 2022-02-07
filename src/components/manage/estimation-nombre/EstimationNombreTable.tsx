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
  EstimationNombreOrderBy,
  EstimationNombreWithCounts,
  EstimationsNombrePaginatedResult,
  MutationDeleteEstimationNombreArgs,
  QueryPaginatedEstimationsNombreArgs,
  SortOrder
} from "../../../model/graphql";
import NotificationSnackbar from "../../common/NotificationSnackbar";
import DeletionConfirmationDialog from "../common/DeletionConfirmationDialog";
import FilterTextField from "../common/FilterTextField";
import TableCellActionButtons from "../common/TableCellActionButtons";

type PaginatedEstimationsNombreQueryResult = {
  paginatedEstimationsNombre: EstimationsNombrePaginatedResult;
};

type DeleteEstimationNombreMutationResult = {
  deleteEstimationNombre: number | null;
};

const PAGINATED_QUERY = gql`
  query PaginatedEstimationsNombre(
    $searchParams: SearchParams
    $orderBy: EstimationNombreOrderBy
    $sortOrder: SortOrder
  ) {
    paginatedEstimationsNombre(searchParams: $searchParams, orderBy: $orderBy, sortOrder: $sortOrder) {
      count
      result {
        id
        libelle
        nbDonnees
        nonCompte
      }
    }
  }
`;

const DELETE = gql`
  mutation DeleteEstimationNombre($id: Int!) {
    deleteEstimationNombre(id: $id)
  }
`;

const COLUMNS = [
  {
    key: "libelle",
    locKey: "label"
  },
  {
    key: "nonCompte",
    locKey: "undefinedNumber"
  },
  {
    key: "nbDonnees",
    locKey: "numberOfObservations"
  }
] as const;

const EstimationNombreTable: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { query, setQuery, page, setPage, rowsPerPage, setRowsPerPage, orderBy, setOrderBy, sortOrder, setSortOrder } =
    usePaginatedTableParams<EstimationNombreOrderBy>();

  const [dialogEstimationNombre, setDialogEstimationNombre] = useState<EstimationNombreWithCounts | null>(null);

  const { data } = useQuery<PaginatedEstimationsNombreQueryResult, QueryPaginatedEstimationsNombreArgs>(
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

  const [deleteEstimationNombre] = useMutation<
    DeleteEstimationNombreMutationResult,
    MutationDeleteEstimationNombreArgs
  >(DELETE);

  const [snackbarContent, setSnackbarContent] = useSnackbarContent();

  const handleEditEstimationNombre = (id: number | undefined) => {
    if (id) {
      navigate(`edit/${id}`);
    }
  };

  const handleDeleteEstimationNombre = (estimationNombre: EstimationNombreWithCounts | null) => {
    if (estimationNombre) {
      setDialogEstimationNombre(estimationNombre);
    }
  };

  const handleDeleteEstimationNombreConfirmation = async (estimationNombre: EstimationNombreWithCounts | null) => {
    if (estimationNombre) {
      setDialogEstimationNombre(null);
      await deleteEstimationNombre({
        variables: {
          id: estimationNombre.id
        },
        refetchQueries: [PAGINATED_QUERY]
      })
        .then(({ data, errors }) => {
          if (!errors && data?.deleteEstimationNombre) {
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

  const handleRequestSort = (sortingColumn: EstimationNombreOrderBy) => {
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
            {data?.paginatedEstimationsNombre?.result?.map((estimationNombre) => {
              return (
                <TableRow hover key={estimationNombre?.id}>
                  <TableCell>{estimationNombre?.libelle}</TableCell>
                  <TableCell>{estimationNombre?.nonCompte ? "Oui" : ""}</TableCell>
                  <TableCell>{estimationNombre?.nbDonnees}</TableCell>
                  <TableCell align="right">
                    <TableCellActionButtons
                      onEditClicked={() => handleEditEstimationNombre(estimationNombre?.id)}
                      onDeleteClicked={() => handleDeleteEstimationNombre(estimationNombre)}
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
                count={data?.paginatedEstimationsNombre?.count ?? 0}
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
        open={!!dialogEstimationNombre}
        messageContent={t("deleteNumberPrecisionDialogMsg", {
          name: dialogEstimationNombre?.libelle
        })}
        impactedItemsMessage={t("deleteNumberPrecisionDialogMsgImpactedData", {
          nbOfObservations: dialogEstimationNombre?.nbDonnees ?? 0
        })}
        onCancelAction={() => setDialogEstimationNombre(null)}
        onConfirmAction={() => handleDeleteEstimationNombreConfirmation(dialogEstimationNombre)}
      />
      <NotificationSnackbar
        keyAlert={snackbarContent?.timestamp}
        type={snackbarContent.type}
        message={snackbarContent.message}
      />
    </>
  );
};

export default EstimationNombreTable;
