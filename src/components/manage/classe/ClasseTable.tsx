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
  Classe,
  ClassesOrderBy,
  ClassesPaginatedResult,
  MutationDeleteClasseArgs,
  QueryClassesArgs,
  SortOrder
} from "../../../graphql/generated/graphql-types";
import usePaginatedTableParams from "../../../hooks/usePaginatedTableParams";
import useSnackbar from "../../../hooks/useSnackbar";
import DeletionConfirmationDialog from "../common/DeletionConfirmationDialog";
import FilterTextField from "../common/FilterTextField";
import TableCellActionButtons from "../common/TableCellActionButtons";

type PaginatedClassesQueryResult = {
  paginatedClasses: ClassesPaginatedResult;
};

type DeleteClasseMutationResult = {
  deleteClasse: number | null;
};

const PAGINATED_QUERY = gql`
  query PaginatedClasses(
    $searchParams: SearchParams
    $orderBy: ClassesOrderBy
    $sortOrder: SortOrder
    $includeCounts: Boolean!
  ) {
    paginatedClasses(
      searchParams: $searchParams
      orderBy: $orderBy
      sortOrder: $sortOrder
      includeCounts: $includeCounts
    ) {
      count
      result {
        id
        libelle
        nbEspeces
        nbDonnees
      }
    }
  }
`;

const DELETE = gql`
  mutation DeleteClasse($id: Int!) {
    deleteClasse(id: $id)
  }
`;

const COLUMNS = [
  {
    key: "libelle",
    locKey: "label"
  },
  {
    key: "nbEspeces",
    locKey: "numberOfSpecies"
  },
  {
    key: "nbDonnees",
    locKey: "numberOfObservations"
  }
] as const;

const ClasseTable: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { query, setQuery, page, setPage, rowsPerPage, setRowsPerPage, orderBy, setOrderBy, sortOrder, setSortOrder } =
    usePaginatedTableParams<ClassesOrderBy>();

  const [dialogClasse, setDialogClasse] = useState<Classe | null>(null);

  const { data } = useQuery<PaginatedClassesQueryResult, QueryClassesArgs>(PAGINATED_QUERY, {
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

  const [deleteClasse] = useMutation<DeleteClasseMutationResult, MutationDeleteClasseArgs>(DELETE);

  const { setSnackbarContent } = useSnackbar();

  const handleEditClasse = (id: number | undefined) => {
    if (id) {
      navigate(`edit/${id}`);
    }
  };

  const handleDeleteClasse = (classe: Classe | null) => {
    if (classe) {
      setDialogClasse(classe);
    }
  };

  const handleDeleteClasseConfirmation = async (classe: Classe | null) => {
    if (classe) {
      setDialogClasse(null);
      await deleteClasse({
        variables: {
          id: classe.id
        },
        refetchQueries: [PAGINATED_QUERY]
      })
        .then(({ data, errors }) => {
          if (!errors && data?.deleteClasse) {
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

  const handleRequestSort = (sortingColumn: ClassesOrderBy) => {
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
            {data?.paginatedClasses?.data?.map((classe) => {
              return (
                <TableRow hover key={classe?.id}>
                  <TableCell>{classe?.libelle}</TableCell>
                  <TableCell>{classe?.nbEspeces}</TableCell>
                  <TableCell>{classe?.nbDonnees}</TableCell>
                  <TableCell align="right">
                    <TableCellActionButtons
                      disabled={!classe.editable}
                      onEditClicked={() => handleEditClasse(classe?.id)}
                      onDeleteClicked={() => handleDeleteClasse(classe)}
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
                count={data?.paginatedClasses?.count ?? 0}
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
        open={!!dialogClasse}
        messageContent={t("deleteClassDialogMsg", {
          name: dialogClasse?.libelle
        })}
        impactedItemsMessage={t("deleteClassDialogMsgImpactedData", {
          nbOfObservations: dialogClasse?.nbDonnees,
          nbOfSpecies: dialogClasse?.nbEspeces
        })}
        onCancelAction={() => setDialogClasse(null)}
        onConfirmAction={() => handleDeleteClasseConfirmation(dialogClasse)}
      />
    </>
  );
};

export default ClasseTable;
