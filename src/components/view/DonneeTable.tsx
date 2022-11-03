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
import React, { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import {
  Donnee,
  MutationDeleteDonneeArgs,
  PaginatedSearchDonneesResult,
  SearchDonneesOrderBy,
  SortOrder
} from "../../graphql/generated/graphql-types";
import usePaginatedTableParams from "../../hooks/usePaginatedTableParams";
import useSnackbar from "../../hooks/useSnackbar";
import DeletionConfirmationDialog from "../manage/common/DeletionConfirmationDialog";
import DonneeDetailsRow from "./DonneeDetailsRow";

type PaginatedDonneesQueryResult = {
  paginatedSearchDonnees: PaginatedSearchDonneesResult;
};

type DeleteDonneeMutationResult = {
  deleteDonnee: number | null;
};

const PAGINATED_SEARCH_DONNEES_QUERY = gql`
  query PaginatedSearchDonnees(
    $sortOrder: SortOrder
    $orderBy: SearchDonneesOrderBy
    $searchParams: SearchDonneeParams
    $searchCriteria: SearchDonneeCriteria
  ) {
    paginatedSearchDonnees(
      sortOrder: $sortOrder
      orderBy: $orderBy
      searchParams: $searchParams
      searchCriteria: $searchCriteria
    ) {
      count
      result {
        id
        inventaire {
          id
          observateur {
            id
            libelle
          }
          associes {
            id
            libelle
          }
          date
          heure
          duree
          lieuDit {
            id
            nom
            altitude
            longitude
            latitude
            coordinatesSystem
            commune {
              id
              code
              nom
              departement {
                id
                code
              }
            }
          }
          customizedCoordinates {
            altitude
            longitude
            latitude
            system
          }
          temperature
          meteos {
            id
            libelle
          }
        }
        espece {
          id
          code
          nomFrancais
          nomLatin
          classe {
            id
            libelle
          }
        }
        sexe {
          id
          libelle
        }
        age {
          id
          libelle
        }
        estimationNombre {
          id
          libelle
          nonCompte
        }
        nombre
        estimationDistance {
          id
          libelle
        }
        distance
        regroupement
        comportements {
          id
          code
          libelle
          nicheur
        }
        milieux {
          id
          code
          libelle
        }
        commentaire
      }
    }
  }
`;

const DELETE_QUERY = gql`
  mutation DeleteDonnee($id: Int!) {
    deleteDonnee(id: $id)
  }
`;

const COLUMNS = [
  {
    key: "nomFrancais",
    locKey: "observationsTable.header.species"
  },
  {
    key: "nombre",
    locKey: "observationsTable.header.number"
  },
  {
    key: "lieuDit",
    locKey: "observationsTable.header.locality"
  },
  {
    key: "date",
    locKey: "observationsTable.header.date"
  },
  {
    key: "observateur",
    locKey: "observationsTable.header.observer"
  }
] as const;

const DonneeTable: FunctionComponent = () => {
  const { t } = useTranslation();

  const { page, setPage, rowsPerPage, setRowsPerPage, orderBy, setOrderBy, sortOrder, setSortOrder } =
    usePaginatedTableParams<SearchDonneesOrderBy>();

  const [deleteDialog, setDeleteDialog] = React.useState<Donnee | null>(null);

  const { setSnackbarContent } = useSnackbar();

  const { data: donneesResult } = useQuery<PaginatedDonneesQueryResult, any>(PAGINATED_SEARCH_DONNEES_QUERY, {
    fetchPolicy: "cache-and-network",
    variables: {
      searchParams: {
        pageNumber: page,
        pageSize: rowsPerPage
      },
      orderBy,
      sortOrder,
      searchCriteria: null
    }
  });

  const [deleteDonnee] = useMutation<DeleteDonneeMutationResult, MutationDeleteDonneeArgs>(DELETE_QUERY);

  const handleEditDonnee = (donnee: Donnee | null) => {
    if (donnee) {
      alert("Edition de la donnée"); //TODO
    }
  };

  const handleDeleteDonnee = (donnee: Donnee | null) => {
    if (donnee) {
      setDeleteDialog(donnee);
    }
  };

  const handleDeleteDonneeConfirmation = async (donnee: Donnee | null) => {
    if (donnee) {
      setDeleteDialog(null);
      await deleteDonnee({
        variables: {
          id: donnee.id
        },
        refetchQueries: [PAGINATED_SEARCH_DONNEES_QUERY]
      })
        .then(({ data, errors }) => {
          if (!errors && data?.deleteDonnee) {
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

  const handleRequestSort = (sortingColumn: SearchDonneesOrderBy) => {
    const isAsc = orderBy === sortingColumn && sortOrder === "asc";
    setSortOrder(isAsc ? "desc" : "asc");
    setOrderBy(sortingColumn);
  };

  return (
    <>
      <TableContainer
        component={Paper}
        sx={{
          mt: 2
        }}
      >
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
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
            {donneesResult?.paginatedSearchDonnees?.result?.map((donnee) => {
              return donnee ? (
                <DonneeDetailsRow
                  key={donnee.id}
                  donnee={donnee}
                  onEditAction={() => handleEditDonnee(donnee)}
                  onDeleteAction={() => handleDeleteDonnee(donnee)}
                />
              ) : (
                <></>
              );
            })}
          </TableBody>

          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[25, 50, 100]}
                count={donneesResult?.paginatedSearchDonnees?.count ?? 0}
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
        open={!!deleteDialog}
        messageContent={t("deleteObservationDialogMsg", {
          species: deleteDialog?.espece.nomFrancais,
          locality: deleteDialog?.inventaire.lieuDit.nom,
          city: deleteDialog?.inventaire.lieuDit.commune.nom,
          department: deleteDialog?.inventaire.lieuDit.commune.departement.code,
          date: deleteDialog?.inventaire.date
        })}
        onCancelAction={() => setDeleteDialog(null)}
        onConfirmAction={() => handleDeleteDonneeConfirmation(deleteDialog)}
      />
    </>
  );
};

export default DonneeTable;
