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
  MeteosPaginatedResult,
  MeteoWithCounts,
  MutationDeleteMeteoArgs,
  QueryPaginatedMeteosArgs,
  SortOrder
} from "../../../model/graphql";
import NotificationSnackbar from "../../common/NotificationSnackbar";
import DeletionConfirmationDialog from "../common/DeletionConfirmationDialog";
import FilterTextField from "../common/FilterTextField";
import TableCellActionButtons from "../common/TableCellActionButtons";

type PaginatedMeteosQueryResult = {
  paginatedMeteos: MeteosPaginatedResult;
};

type DeleteMeteoMutationResult = {
  deleteMeteo: number | null;
};

const PAGINATED_QUERY = gql`
  query PaginatedMeteos(
    $searchParams: SearchParams
    $orderBy: EntitesAvecLibelleOrderBy
    $sortOrder: SortOrder
    $includeCounts: Boolean!
  ) {
    paginatedMeteos(
      searchParams: $searchParams
      orderBy: $orderBy
      sortOrder: $sortOrder
      includeCounts: $includeCounts
    ) {
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
  mutation DeleteMeteo($id: Int!) {
    deleteMeteo(id: $id)
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

const MeteoTable: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { query, setQuery, page, setPage, rowsPerPage, setRowsPerPage, orderBy, setOrderBy, sortOrder, setSortOrder } =
    usePaginatedTableParams<EntitesAvecLibelleOrderBy>();

  const [dialogMeteo, setDialogMeteo] = useState<MeteoWithCounts | null>(null);

  const { data } = useQuery<PaginatedMeteosQueryResult, QueryPaginatedMeteosArgs>(PAGINATED_QUERY, {
    fetchPolicy: "cache-and-network",
    variables: {
      searchParams: {
        pageNumber: page,
        pageSize: rowsPerPage,
        q: query
      },
      orderBy,
      sortOrder,
      includeCounts: true
    }
  });

  const [deleteMeteo] = useMutation<DeleteMeteoMutationResult, MutationDeleteMeteoArgs>(DELETE);

  const [snackbarContent, setSnackbarContent] = useSnackbarContent();

  const handleEditMeteo = (id: number | undefined) => {
    if (id) {
      navigate(`edit/${id}`);
    }
  };

  const handleDeleteMeteo = (meteo: MeteoWithCounts | null) => {
    if (meteo) {
      setDialogMeteo(meteo);
    }
  };

  const handleDeleteMeteoConfirmation = async (meteo: MeteoWithCounts | null) => {
    if (meteo) {
      setDialogMeteo(null);
      await deleteMeteo({
        variables: {
          id: meteo.id
        },
        refetchQueries: [PAGINATED_QUERY]
      })
        .then(({ data, errors }) => {
          if (!errors && data?.deleteMeteo) {
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
            {data?.paginatedMeteos?.result?.map((meteo) => {
              return (
                <TableRow hover key={meteo?.id}>
                  <TableCell>{meteo?.libelle}</TableCell>
                  <TableCell>{meteo?.nbDonnees}</TableCell>
                  <TableCell align="right">
                    <TableCellActionButtons
                      onEditClicked={() => handleEditMeteo(meteo?.id)}
                      onDeleteClicked={() => handleDeleteMeteo(meteo)}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[25, 50, 100]}
                count={data?.paginatedMeteos?.count ?? 0}
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
        open={!!dialogMeteo}
        messageContent={t("deleteWeatherDialogMsg", {
          name: dialogMeteo?.libelle
        })}
        impactedItemsMessage={t("deleteWeatherDialogMsgImpactedData")}
        onCancelAction={() => setDialogMeteo(null)}
        onConfirmAction={() => handleDeleteMeteoConfirmation(dialogMeteo)}
      />
      <NotificationSnackbar
        keyAlert={snackbarContent?.timestamp}
        type={snackbarContent.type}
        message={snackbarContent.message}
      />
    </>
  );
};

export default MeteoTable;
