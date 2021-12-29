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
import { ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import usePaginatedTableParams from "../../../hooks/usePaginatedTableParams";
import useSnackbarContent from "../../../hooks/useSnackbarContent";
import {
  EntitesAvecLibelleOrderBy,
  MutationDeleteObservateurArgs,
  ObservateursPaginatedResult,
  ObservateurWithCounts,
  QueryPaginatedObservateursArgs,
  SortOrder
} from "../../../model/graphql";
import NotificationSnackbar from "../../common/NotificationSnackbar";
import DeletionConfirmationDialog from "../common/DeletionConfirmationDialog";
import FilterTextField from "../common/FilterTextField";
import TableCellActionButtons from "../common/TableCellActionButtons";

type PaginatedObservateursQueryResult = {
  paginatedObservateurs: ObservateursPaginatedResult;
};

type DeleteObservateurMutationResult = {
  deleteObservateur: number | null;
};

const PAGINATED_OBSERVATEURS_QUERY = gql`
  query PaginatedObservateurs($searchParams: SearchParams, $orderBy: EntitesAvecLibelleOrderBy, $sortOrder: SortOrder) {
    paginatedObservateurs(searchParams: $searchParams, orderBy: $orderBy, sortOrder: $sortOrder) {
      count
      result {
        id
        libelle
        nbDonnees
      }
    }
  }
`;

const DELETE_OBSERVATEUR = gql`
  mutation DeleteObservateur($id: Int!) {
    deleteObservateur(id: $id)
  }
`;

const COLUMNS = [
  {
    key: "libelle",
    locKey: "label"
  },
  {
    key: "nbDonnees",
    locKey: "speciesNumber"
  }
] as const;

export default function ObservateurTable(): ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { query, setQuery, page, setPage, rowsPerPage, setRowsPerPage, orderBy, setOrderBy, sortOrder, setSortOrder } =
    usePaginatedTableParams<EntitesAvecLibelleOrderBy>();

  const [dialogObservateur, setDialogObservateur] = useState<ObservateurWithCounts | null>(null);

  const { data } = useQuery<PaginatedObservateursQueryResult, QueryPaginatedObservateursArgs>(
    PAGINATED_OBSERVATEURS_QUERY,
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

  const [deleteObservateur] = useMutation<DeleteObservateurMutationResult, MutationDeleteObservateurArgs>(
    DELETE_OBSERVATEUR
  );

  const [snackbarContent, setSnackbarContent] = useSnackbarContent();

  const handleEditObservateur = (id: number | undefined) => {
    if (id) {
      navigate(`edit/${id}`);
    }
  };

  const handleDeleteObservateur = (observateur: ObservateurWithCounts | null) => {
    if (observateur) {
      setDialogObservateur(observateur);
    }
  };

  const handleDeleteObservateurConfirmation = async (observateur: ObservateurWithCounts | null) => {
    if (observateur) {
      setDialogObservateur(null);
      await deleteObservateur({
        variables: {
          id: observateur.id
        },
        refetchQueries: [PAGINATED_OBSERVATEURS_QUERY]
      })
        .then(({ data, errors }) => {
          if (!errors && data?.deleteObservateur) {
            setSnackbarContent({
              type: "success",
              message: t("deleteObserverConfirmationMessage")
            });
          }
        })
        .catch(() => {
          setSnackbarContent({
            type: "error",
            message: t("deleteObserverErrorMessage")
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
            {data?.paginatedObservateurs?.result?.map((observateur) => {
              return (
                <TableRow hover key={observateur?.id}>
                  <TableCell>{observateur?.libelle}</TableCell>
                  <TableCell>{observateur?.nbDonnees}</TableCell>
                  <TableCell align="right">
                    <TableCellActionButtons
                      onEditClicked={() => handleEditObservateur(observateur?.id)}
                      onDeleteClicked={() => handleDeleteObservateur(observateur)}
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
                count={data?.paginatedObservateurs?.count ?? 0}
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
        open={!!dialogObservateur}
        messageContent={t("deleteObserverConfirmationDialogMessage", {
          name: dialogObservateur?.libelle,
          nbData: dialogObservateur?.nbDonnees
        })}
        onCancelAction={() => setDialogObservateur(null)}
        onConfirmAction={() => handleDeleteObservateurConfirmation(dialogObservateur)}
      />
      <NotificationSnackbar
        keyAlert={snackbarContent?.timestamp}
        type={snackbarContent.type}
        message={snackbarContent.message}
      />
    </>
  );
}
