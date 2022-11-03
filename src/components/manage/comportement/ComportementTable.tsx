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
import {
  Comportement,
  ComportementsOrderBy,
  ComportementsPaginatedResult,
  MutationDeleteComportementArgs,
  QueryComportementsArgs
} from "../../../gql/graphql";
import usePaginatedTableParams from "../../../hooks/usePaginatedTableParams";
import useSnackbar from "../../../hooks/useSnackbar";
import DeletionConfirmationDialog from "../common/DeletionConfirmationDialog";
import FilterTextField from "../common/FilterTextField";
import TableCellActionButtons from "../common/TableCellActionButtons";

type PaginatedComportementsQueryResult = {
  paginatedComportements: ComportementsPaginatedResult;
};

type DeleteComportementMutationResult = {
  deleteComportement: number | null;
};

const PAGINATED_QUERY = gql`
  query PaginatedComportements(
    $searchParams: SearchParams
    $orderBy: ComportementsOrderBy
    $sortOrder: SortOrder
    $includeCounts: Boolean!
  ) {
    paginatedComportements(
      searchParams: $searchParams
      orderBy: $orderBy
      sortOrder: $sortOrder
      includeCounts: $includeCounts
    ) {
      count
      result {
        id
        code
        libelle
        nicheur
        nbDonnees
      }
    }
  }
`;

const DELETE = gql`
  mutation DeleteComportement($id: Int!) {
    deleteComportement(id: $id)
  }
`;

const COLUMNS = [
  {
    key: "code",
    locKey: "code"
  },
  {
    key: "libelle",
    locKey: "label"
  },
  {
    key: "nicheur",
    locKey: "breeding"
  },
  {
    key: "nbDonnees",
    locKey: "numberOfObservations"
  }
] as const;

const ComportementTable: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { query, setQuery, page, setPage, rowsPerPage, setRowsPerPage, orderBy, setOrderBy, sortOrder, setSortOrder } =
    usePaginatedTableParams<ComportementsOrderBy>();

  const [dialogComportement, setDialogComportement] = useState<Comportement | null>(null);

  const { data } = useQuery<PaginatedComportementsQueryResult, QueryComportementsArgs>(PAGINATED_QUERY, {
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

  const [deleteComportement] = useMutation<DeleteComportementMutationResult, MutationDeleteComportementArgs>(DELETE);

  const { setSnackbarContent } = useSnackbar();

  const handleEditComportement = (id: number | undefined) => {
    if (id) {
      navigate(`edit/${id}`);
    }
  };

  const handleDeleteComportement = (comportement: Comportement | null) => {
    if (comportement) {
      setDialogComportement(comportement);
    }
  };

  const handleDeleteComportementConfirmation = async (comportement: Comportement | null) => {
    if (comportement) {
      setDialogComportement(null);
      await deleteComportement({
        variables: {
          id: comportement.id
        },
        refetchQueries: [PAGINATED_QUERY]
      })
        .then(({ data, errors }) => {
          if (!errors && data?.deleteComportement) {
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

  const handleRequestSort = (sortingColumn: ComportementsOrderBy) => {
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
                        {sortOrder === "desc" ? t("aria-descendingSort") : t("aria-ascendingSort")}
                      </Box>
                    ) : null}
                  </TableSortLabel>
                </TableCell>
              ))}
              <TableCell align="right">{t("actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.paginatedComportements?.data?.map((comportement) => {
              return (
                <TableRow hover key={comportement?.id}>
                  <TableCell>{comportement?.code}</TableCell>
                  <TableCell>{comportement?.libelle}</TableCell>
                  <TableCell>{comportement?.nicheur ? t(`breedingStatus.${comportement?.nicheur}`) : ""}</TableCell>
                  <TableCell>{comportement?.nbDonnees}</TableCell>
                  <TableCell align="right">
                    <TableCellActionButtons
                      disabled={!comportement.editable}
                      onEditClicked={() => handleEditComportement(comportement?.id)}
                      onDeleteClicked={() => handleDeleteComportement(comportement)}
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
                count={data?.paginatedComportements?.count ?? 0}
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
        open={!!dialogComportement}
        messageContent={t("deleteBehaviorDialogMsg", {
          name: dialogComportement?.libelle
        })}
        impactedItemsMessage={t("deleteBehaviorDialogMsgImpactedData")}
        onCancelAction={() => setDialogComportement(null)}
        onConfirmAction={() => handleDeleteComportementConfirmation(dialogComportement)}
      />
    </>
  );
};

export default ComportementTable;
