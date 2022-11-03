import { gql, useMutation } from "@apollo/client";
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
  TableSortLabel,
} from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import { FunctionComponent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { graphql } from "../../../gql";
import {
  EntitesAvecLibelleOrderBy,
  MutationDeleteObservateurArgs,
  Observateur,
  ObservateursQuery,
} from "../../../gql/graphql";
import useGraphQLRequestContext from "../../../hooks/useGraphQLRequestContext";
import usePaginatedTableParams from "../../../hooks/usePaginatedTableParams";
import useSnackbar from "../../../hooks/useSnackbar";
import DeletionConfirmationDialog from "../common/DeletionConfirmationDialog";
import FilterTextField from "../common/FilterTextField";
import TableCellActionButtons from "../common/TableCellActionButtons";

type DeleteObservateurMutationResult = {
  deleteObservateur: number | null;
};

const PAGINATED_OBSERVATEURS_QUERY = gql`
  query Observateurs($searchParams: SearchParams, $orderBy: EntitesAvecLibelleOrderBy, $sortOrder: SortOrder) {
    observateurs(searchParams: $searchParams, orderBy: $orderBy, sortOrder: $sortOrder) {
      count
      data {
        id
        libelle
        editable
        nbDonnees
      }
    }
  }
`;

const PAGINATED_OBSERVATEURS_QUERY_RQ = graphql(`
  query Observateurs($searchParams: SearchParams, $orderBy: EntitesAvecLibelleOrderBy, $sortOrder: SortOrder) {
    observateurs(searchParams: $searchParams, orderBy: $orderBy, sortOrder: $sortOrder) {
      count
      data {
        id
        libelle
        editable
        nbDonnees
      }
    }
  }
`);

const DELETE_OBSERVATEUR = gql`
  mutation DeleteObservateur($id: Int!) {
    deleteObservateur(id: $id)
  }
`;

const COLUMNS = [
  {
    key: "libelle",
    locKey: "label",
  },
  {
    key: "nbDonnees",
    locKey: "numberOfObservations",
  },
] as const;

const ObservateurTable: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { query, setQuery, page, setPage, rowsPerPage, setRowsPerPage, orderBy, setOrderBy, sortOrder, setSortOrder } =
    usePaginatedTableParams<EntitesAvecLibelleOrderBy>();

  const [dialogObservateur, setDialogObservateur] = useState<Observateur | null>(null);

  const [data, setData] = useState<ObservateursQuery | null>(null);

  // const { data } = useQuery<PaginatedObservateursQueryResult, QueryObservateursArgs>(PAGINATED_OBSERVATEURS_QUERY, {
  //   fetchPolicy: "cache-and-network",
  //   variables: {
  //     searchParams: {
  //       pageNumber: page,
  //       pageSize: rowsPerPage,
  //       q: query
  //     },
  //     orderBy,
  //     sortOrder
  //   }
  // });

  const client = useGraphQLRequestContext();

  const [deleteObservateur] = useMutation<DeleteObservateurMutationResult, MutationDeleteObservateurArgs>(
    DELETE_OBSERVATEUR
  );

  const { setSnackbarContent } = useSnackbar();

  useEffect(() => {
    void client
      .request(PAGINATED_OBSERVATEURS_QUERY_RQ, {
        searchParams: {
          pageNumber: page,
          pageSize: rowsPerPage,
          q: query,
        },
        orderBy,
        sortOrder,
      })
      .then((data) => {
        setData(data);
      });
  }, [page, rowsPerPage, query, orderBy, sortOrder]);

  const handleEditObservateur = (id: number | undefined) => {
    if (id) {
      navigate(`edit/${id}`);
    }
  };

  const handleDeleteObservateur = (observateur: Observateur | null) => {
    if (observateur) {
      setDialogObservateur(observateur);
    }
  };

  const handleDeleteObservateurConfirmation = async (observateur: Observateur | null) => {
    if (observateur) {
      setDialogObservateur(null);
      await deleteObservateur({
        variables: {
          id: observateur.id,
        },
        refetchQueries: [PAGINATED_OBSERVATEURS_QUERY],
      })
        .then(({ data, errors }) => {
          if (!errors && data?.deleteObservateur) {
            setSnackbarContent({
              type: "success",
              message: t("deleteConfirmationMessage"),
            });
          }
        })
        .catch(() => {
          setSnackbarContent({
            type: "error",
            message: t("deleteErrorMessage"),
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
          mt: 2,
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
            {data?.observateurs?.data?.map((observateur) => {
              return (
                <TableRow hover key={observateur?.id}>
                  <TableCell>{observateur?.libelle}</TableCell>
                  <TableCell>{observateur?.nbDonnees}</TableCell>
                  <TableCell align="right">
                    <TableCellActionButtons
                      disabled={!observateur.editable}
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
                rowsPerPageOptions={[25, 50, 100]}
                count={data?.observateurs?.count ?? 0}
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
        messageContent={t("deleteObserverDialogMsg", {
          name: dialogObservateur?.libelle,
        })}
        impactedItemsMessage={t("deleteObserverDialogMsgImpactedData", {
          nbOfObservations: dialogObservateur?.nbDonnees ?? 0,
        })}
        onCancelAction={() => setDialogObservateur(null)}
        onConfirmAction={() => handleDeleteObservateurConfirmation(dialogObservateur)}
      />
    </>
  );
};

export default ObservateurTable;
