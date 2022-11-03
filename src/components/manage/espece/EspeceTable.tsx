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
  Espece,
  EspecesOrderBy,
  EspecesPaginatedResult,
  MutationDeleteEspeceArgs,
  QueryEspecesArgs,
  SortOrder
} from "../../../graphql/generated/graphql-types";
import usePaginatedTableParams from "../../../hooks/usePaginatedTableParams";
import useSnackbar from "../../../hooks/useSnackbar";
import DeletionConfirmationDialog from "../common/DeletionConfirmationDialog";
import FilterTextField from "../common/FilterTextField";
import TableCellActionButtons from "../common/TableCellActionButtons";

type PaginatedEspecesQueryResult = {
  paginatedEspeces: EspecesPaginatedResult;
};

type DeleteEspeceMutationResult = {
  deleteEspece: number | null;
};

const PAGINATED_QUERY = gql`
  query PaginatedEspeces(
    $searchParams: SearchParams
    $orderBy: EspecesOrderBy
    $sortOrder: SortOrder
    $includeCounts: Boolean!
  ) {
    paginatedEspeces(
      searchParams: $searchParams
      orderBy: $orderBy
      sortOrder: $sortOrder
      includeCounts: $includeCounts
    ) {
      count
      result {
        id
        classe {
          libelle
        }
        code
        nomFrancais
        nomLatin
        nbDonnees
      }
    }
  }
`;

const DELETE = gql`
  mutation DeleteEspece($id: Int!) {
    deleteEspece(id: $id)
  }
`;

const COLUMNS = [
  {
    key: "nomClasse",
    locKey: "speciesClass"
  },
  {
    key: "code",
    locKey: "code"
  },
  {
    key: "nomFrancais",
    locKey: "frenchName"
  },
  {
    key: "nomLatin",
    locKey: "scientificName"
  },
  {
    key: "nbDonnees",
    locKey: "numberOfObservations"
  }
] as const;

const EspeceTable: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { query, setQuery, page, setPage, rowsPerPage, setRowsPerPage, orderBy, setOrderBy, sortOrder, setSortOrder } =
    usePaginatedTableParams<EspecesOrderBy>();

  const [dialogEspece, setDialogEspece] = useState<Espece | null>(null);

  const { data } = useQuery<PaginatedEspecesQueryResult, QueryEspecesArgs>(PAGINATED_QUERY, {
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

  const [deleteEspece] = useMutation<DeleteEspeceMutationResult, MutationDeleteEspeceArgs>(DELETE);

  const { setSnackbarContent } = useSnackbar();

  const handleEditEspece = (id: number | undefined) => {
    if (id) {
      navigate(`edit/${id}`);
    }
  };

  const handleDeleteEspece = (espece: Espece | null) => {
    if (espece) {
      setDialogEspece(espece);
    }
  };

  const handleDeleteEspeceConfirmation = async (espece: Espece | null) => {
    if (espece) {
      setDialogEspece(null);
      await deleteEspece({
        variables: {
          id: espece.id
        },
        refetchQueries: [PAGINATED_QUERY]
      })
        .then(({ data, errors }) => {
          if (!errors && data?.deleteEspece) {
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

  const handleRequestSort = (sortingColumn: EspecesOrderBy) => {
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
            {data?.paginatedEspeces?.data?.map((espece) => {
              return (
                <TableRow hover key={espece?.id}>
                  <TableCell>{espece?.classe?.libelle}</TableCell>
                  <TableCell>{espece?.code}</TableCell>
                  <TableCell>{espece?.nomFrancais}</TableCell>
                  <TableCell>{espece?.nomLatin}</TableCell>
                  <TableCell>{espece?.nbDonnees ? espece?.nbDonnees : "0"}</TableCell>
                  <TableCell align="right">
                    <TableCellActionButtons
                      disabled={!espece.editable}
                      onEditClicked={() => handleEditEspece(espece?.id)}
                      onDeleteClicked={() => handleDeleteEspece(espece)}
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
                count={data?.paginatedEspeces?.count ?? 0}
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
        open={!!dialogEspece}
        messageContent={t("deleteSpeciesDialogMsg", {
          name: dialogEspece?.nomFrancais,
          code: dialogEspece?.code
        })}
        impactedItemsMessage={t("deleteSpeciesDialogMsgImpactedData", {
          nbOfObservations: dialogEspece?.nbDonnees ? dialogEspece?.nbDonnees : 0
        })}
        onCancelAction={() => setDialogEspece(null)}
        onConfirmAction={() => handleDeleteEspeceConfirmation(dialogEspece)}
      />
    </>
  );
};

export default EspeceTable;
