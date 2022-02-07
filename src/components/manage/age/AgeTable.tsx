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
  AgesPaginatedResult,
  AgeWithCounts,
  EntitesAvecLibelleOrderBy,
  MutationDeleteAgeArgs,
  QueryPaginatedAgesArgs,
  SortOrder
} from "../../../model/graphql";
import NotificationSnackbar from "../../common/NotificationSnackbar";
import DeletionConfirmationDialog from "../common/DeletionConfirmationDialog";
import FilterTextField from "../common/FilterTextField";
import TableCellActionButtons from "../common/TableCellActionButtons";

type PaginatedAgesQueryResult = {
  paginatedAges: AgesPaginatedResult;
};

type DeleteAgeMutationResult = {
  deleteAge: number | null;
};

const PAGINATED_AGES_QUERY = gql`
  query PaginatedAges($searchParams: SearchParams, $orderBy: EntitesAvecLibelleOrderBy, $sortOrder: SortOrder) {
    paginatedAges(searchParams: $searchParams, orderBy: $orderBy, sortOrder: $sortOrder) {
      count
      result {
        id
        libelle
        nbDonnees
      }
    }
  }
`;

const DELETE_AGE = gql`
  mutation DeleteAge($id: Int!) {
    deleteAge(id: $id)
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

const AgeTable: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { query, setQuery, page, setPage, rowsPerPage, setRowsPerPage, orderBy, setOrderBy, sortOrder, setSortOrder } =
    usePaginatedTableParams<EntitesAvecLibelleOrderBy>();

  const [dialogAge, setDialogAge] = useState<AgeWithCounts | null>(null);

  const { data } = useQuery<PaginatedAgesQueryResult, QueryPaginatedAgesArgs>(PAGINATED_AGES_QUERY, {
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
  });

  const [deleteAge] = useMutation<DeleteAgeMutationResult, MutationDeleteAgeArgs>(DELETE_AGE);

  const [snackbarContent, setSnackbarContent] = useSnackbarContent();

  const handleEditAge = (id: number | undefined) => {
    if (id) {
      navigate(`edit/${id}`);
    }
  };

  const handleDeleteAge = (age: AgeWithCounts | null) => {
    if (age) {
      setDialogAge(age);
    }
  };

  const handleDeleteAgeConfirmation = async (age: AgeWithCounts | null) => {
    if (age) {
      setDialogAge(null);
      await deleteAge({
        variables: {
          id: age.id
        },
        refetchQueries: [PAGINATED_AGES_QUERY]
      })
        .then(({ data, errors }) => {
          if (!errors && data?.deleteAge) {
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
            {data?.paginatedAges?.result?.map((age) => {
              return (
                <TableRow hover key={age?.id}>
                  <TableCell>{age?.libelle}</TableCell>
                  <TableCell>{age?.nbDonnees}</TableCell>
                  <TableCell align="right">
                    <TableCellActionButtons
                      onEditClicked={() => handleEditAge(age?.id)}
                      onDeleteClicked={() => handleDeleteAge(age)}
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
                count={data?.paginatedAges?.count ?? 0}
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
        open={!!dialogAge}
        messageContent={t("deleteAgeDialogMsg", {
          name: dialogAge?.libelle
        })}
        impactedItemsMessage={t("deleteAgeDialogMsgImpactedData", {
          nbOfObservations: dialogAge?.nbDonnees ?? 0
        })}
        onCancelAction={() => setDialogAge(null)}
        onConfirmAction={() => handleDeleteAgeConfirmation(dialogAge)}
      />
      <NotificationSnackbar
        keyAlert={snackbarContent?.timestamp}
        type={snackbarContent.type}
        message={snackbarContent.message}
      />
    </>
  );
};

export default AgeTable;
