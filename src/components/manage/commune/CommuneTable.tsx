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
  CommunesOrderBy,
  CommunesPaginatedResult,
  CommuneWithCounts,
  MutationDeleteCommuneArgs,
  QueryPaginatedCommunesArgs,
  SortOrder
} from "../../../model/graphql";
import NotificationSnackbar from "../../common/NotificationSnackbar";
import DeletionConfirmationDialog from "../common/DeletionConfirmationDialog";
import FilterTextField from "../common/FilterTextField";
import TableCellActionButtons from "../common/TableCellActionButtons";

type PaginatedCommunesQueryResult = {
  paginatedCommunes: CommunesPaginatedResult;
};

type DeleteCommuneMutationResult = {
  deleteCommune: number | null;
};

const PAGINATED_QUERY = gql`
  query PaginatedCommunes($searchParams: SearchParams, $orderBy: CommunesOrderBy, $sortOrder: SortOrder) {
    paginatedCommunes(searchParams: $searchParams, orderBy: $orderBy, sortOrder: $sortOrder) {
      count
      result {
        departement {
          code
        }
        id
        code
        nom
        nbLieuxDits
        nbDonnees
      }
    }
  }
`;

const DELETE = gql`
  mutation DeleteCommune($id: Int!) {
    deleteCommune(id: $id)
  }
`;

const COLUMNS = [
  {
    key: "departement",
    locKey: "department"
  },
  {
    key: "code",
    locKey: "code"
  },
  {
    key: "nom",
    locKey: "name"
  },
  {
    key: "nbLieuxDits",
    locKey: "numberOfLocalities"
  },
  {
    key: "nbDonnees",
    locKey: "numberOfObservations"
  }
] as const;

const CommuneTable: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { query, setQuery, page, setPage, rowsPerPage, setRowsPerPage, orderBy, setOrderBy, sortOrder, setSortOrder } =
    usePaginatedTableParams<CommunesOrderBy>();

  const [dialogCommune, setDialogCommune] = useState<CommuneWithCounts | null>(null);

  const { data } = useQuery<PaginatedCommunesQueryResult, QueryPaginatedCommunesArgs>(PAGINATED_QUERY, {
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

  const [deleteCommune] = useMutation<DeleteCommuneMutationResult, MutationDeleteCommuneArgs>(DELETE);

  const [snackbarContent, setSnackbarContent] = useSnackbarContent();

  const handleEditCommune = (id: number | undefined) => {
    if (id) {
      navigate(`edit/${id}`);
    }
  };

  const handleDeleteCommune = (commune: CommuneWithCounts | null) => {
    if (commune) {
      setDialogCommune(commune);
    }
  };

  const handleDeleteCommuneConfirmation = async (commune: CommuneWithCounts | null) => {
    if (commune) {
      setDialogCommune(null);
      await deleteCommune({
        variables: {
          id: commune.id
        },
        refetchQueries: [PAGINATED_QUERY]
      })
        .then(({ data, errors }) => {
          if (!errors && data?.deleteCommune) {
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

  const handleRequestSort = (sortingColumn: CommunesOrderBy) => {
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
            {data?.paginatedCommunes?.result?.map((commune) => {
              return (
                <TableRow hover key={commune?.id}>
                  <TableCell>{commune?.departement?.code}</TableCell>
                  <TableCell>{commune?.code}</TableCell>
                  <TableCell>{commune?.nom}</TableCell>
                  <TableCell>{commune?.nbLieuxDits}</TableCell>
                  <TableCell>{commune?.nbDonnees}</TableCell>
                  <TableCell align="right">
                    <TableCellActionButtons
                      onEditClicked={() => handleEditCommune(commune?.id)}
                      onDeleteClicked={() => handleDeleteCommune(commune)}
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
                count={data?.paginatedCommunes?.count ?? 0}
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
        open={!!dialogCommune}
        messageContent={t("deleteCityDialogMsg", {
          name: dialogCommune?.nom,
          department: dialogCommune?.departement?.code
        })}
        impactedItemsMessage={t("deleteCityDialogMsgImpactedData", {
          nbOfObservations: dialogCommune?.nbDonnees ?? 0,
          nbOfLocalities: dialogCommune?.nbLieuxDits ?? 0
        })}
        onCancelAction={() => setDialogCommune(null)}
        onConfirmAction={() => handleDeleteCommuneConfirmation(dialogCommune)}
      />
      <NotificationSnackbar
        keyAlert={snackbarContent?.timestamp}
        type={snackbarContent.type}
        message={snackbarContent.message}
      />
    </>
  );
};

export default CommuneTable;
