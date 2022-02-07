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
  MutationDeleteSexeArgs,
  QueryPaginatedSexesArgs,
  SexesPaginatedResult,
  SexeWithCounts,
  SortOrder
} from "../../../model/graphql";
import NotificationSnackbar from "../../common/NotificationSnackbar";
import DeletionConfirmationDialog from "../common/DeletionConfirmationDialog";
import FilterTextField from "../common/FilterTextField";
import TableCellActionButtons from "../common/TableCellActionButtons";

type PaginatedSexesQueryResult = {
  paginatedSexes: SexesPaginatedResult;
};

type DeleteSexeMutationResult = {
  deleteSexe: number | null;
};

const PAGINATED_QUERY = gql`
  query PaginatedSexes($searchParams: SearchParams, $orderBy: EntitesAvecLibelleOrderBy, $sortOrder: SortOrder) {
    paginatedSexes(searchParams: $searchParams, orderBy: $orderBy, sortOrder: $sortOrder) {
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
  mutation DeleteSexe($id: Int!) {
    deleteSexe(id: $id)
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

const SexeTable: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { query, setQuery, page, setPage, rowsPerPage, setRowsPerPage, orderBy, setOrderBy, sortOrder, setSortOrder } =
    usePaginatedTableParams<EntitesAvecLibelleOrderBy>();

  const [dialogSexe, setDialogSexe] = useState<SexeWithCounts | null>(null);

  const { data } = useQuery<PaginatedSexesQueryResult, QueryPaginatedSexesArgs>(PAGINATED_QUERY, {
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

  const [deleteSexe] = useMutation<DeleteSexeMutationResult, MutationDeleteSexeArgs>(DELETE);

  const [snackbarContent, setSnackbarContent] = useSnackbarContent();

  const handleEditSexe = (id: number | undefined) => {
    if (id) {
      navigate(`edit/${id}`);
    }
  };

  const handleDeleteSexe = (sexe: SexeWithCounts | null) => {
    if (sexe) {
      setDialogSexe(sexe);
    }
  };

  const handleDeleteSexeConfirmation = async (sexe: SexeWithCounts | null) => {
    if (sexe) {
      setDialogSexe(null);
      await deleteSexe({
        variables: {
          id: sexe.id
        },
        refetchQueries: [PAGINATED_QUERY]
      })
        .then(({ data, errors }) => {
          if (!errors && data?.deleteSexe) {
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
            {data?.paginatedSexes?.result?.map((sexe) => {
              return (
                <TableRow hover key={sexe?.id}>
                  <TableCell>{sexe?.libelle}</TableCell>
                  <TableCell>{sexe?.nbDonnees}</TableCell>
                  <TableCell align="right">
                    <TableCellActionButtons
                      onEditClicked={() => handleEditSexe(sexe?.id)}
                      onDeleteClicked={() => handleDeleteSexe(sexe)}
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
                count={data?.paginatedSexes?.count ?? 0}
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
        open={!!dialogSexe}
        messageContent={t("deleteGenderDialogMsg", {
          name: dialogSexe?.libelle
        })}
        impactedItemsMessage={t("deleteGenderDialogMsgImpactedData", {
          nbOfObservations: dialogSexe?.nbDonnees
        })}
        onCancelAction={() => setDialogSexe(null)}
        onConfirmAction={() => handleDeleteSexeConfirmation(dialogSexe)}
      />
      <NotificationSnackbar
        keyAlert={snackbarContent?.timestamp}
        type={snackbarContent.type}
        message={snackbarContent.message}
      />
    </>
  );
};

export default SexeTable;
