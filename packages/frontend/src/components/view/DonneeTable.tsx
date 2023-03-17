import { useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery } from "urql";
import { graphql } from "../../gql";
import { type Donnee, type SearchDonneesOrderBy } from "../../gql/graphql";
import usePaginatedTableParams from "../../hooks/usePaginatedTableParams";
import useSnackbar from "../../hooks/useSnackbar";
import Table from "../common/styled/table/Table";
import TableSortLabel from "../common/styled/table/TableSortLabel";
import DeletionConfirmationDialog from "../manage/common/DeletionConfirmationDialog";
import DonneeDetailsRow from "./DonneeDetailsRow";

const PAGINATED_SEARCH_DONNEES_QUERY = graphql(`
  query PaginatedSearchDonnees(
    $sortOrder: SortOrder
    $orderBy: SearchDonneesOrderBy
    $searchParams: SearchDonneeParams
    $searchCriteria: SearchDonneeCriteria
  ) {
    searchDonnees {
      count(searchCriteria: $searchCriteria)
      result(sortOrder: $sortOrder, orderBy: $orderBy, searchParams: $searchParams, searchCriteria: $searchCriteria) {
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
`);

const DELETE_QUERY = graphql(`
  mutation DeleteDonnee($id: Int!) {
    deleteDonnee(id: $id)
  }
`);

const COLUMNS = [
  {
    key: "nomFrancais",
    locKey: "observationsTable.header.species",
  },
  {
    key: "nombre",
    locKey: "observationsTable.header.number",
  },
  {
    key: "lieuDit",
    locKey: "observationsTable.header.locality",
  },
  {
    key: "date",
    locKey: "observationsTable.header.date",
  },
  {
    key: "observateur",
    locKey: "observationsTable.header.observer",
  },
] as const;

const DonneeTable: FunctionComponent = () => {
  const { t } = useTranslation();

  const { page, setPage, rowsPerPage, orderBy, setOrderBy, sortOrder, setSortOrder } =
    usePaginatedTableParams<SearchDonneesOrderBy>();

  const [deleteDialog, setDeleteDialog] = useState<Donnee | null>(null);

  const { displayNotification } = useSnackbar();

  const [{ data: donneesResult }, reexecuteSearchDonneesQuery] = useQuery({
    query: PAGINATED_SEARCH_DONNEES_QUERY,
    variables: {
      searchParams: {
        pageNumber: page,
        pageSize: rowsPerPage,
      },
      orderBy,
      sortOrder,
      searchCriteria: null,
    },
    requestPolicy: "cache-and-network",
  });

  const [_, deleteDonnee] = useMutation(DELETE_QUERY);

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
        id: donnee.id,
      })
        .then(({ data, error }) => {
          if (!error && data?.deleteDonnee) {
            displayNotification({
              type: "success",
              message: t("deleteConfirmationMessage"),
            });
          }
          reexecuteSearchDonneesQuery();
        })
        .catch(() => {
          displayNotification({
            type: "error",
            message: t("deleteErrorMessage"),
          });
        });
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRequestSort = (sortingColumn: SearchDonneesOrderBy) => {
    const isAsc = orderBy === sortingColumn && sortOrder === "asc";
    setSortOrder(isAsc ? "desc" : "asc");
    setOrderBy(sortingColumn);
  };

  return (
    <>
      <Table
        tableHead={
          <>
            <th></th>
            {COLUMNS.map((column) => (
              <th key={column.key}>
                <TableSortLabel
                  active={orderBy === column.key}
                  direction={orderBy === column.key ? sortOrder : "asc"}
                  onClick={() => handleRequestSort(column.key)}
                >
                  {t(column.locKey)}
                </TableSortLabel>
              </th>
            ))}
            <th align="right" className="pr-8">
              {t("actions")}
            </th>
          </>
        }
        tableRows={donneesResult?.searchDonnees?.result?.map((donnee) => {
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
        page={page}
        elementsPerPage={rowsPerPage}
        count={donneesResult?.searchDonnees?.count ?? 0}
        onPageChange={handleChangePage}
      ></Table>

      <DeletionConfirmationDialog
        open={!!deleteDialog}
        messageContent={t("deleteObservationDialogMsg", {
          species: deleteDialog?.espece.nomFrancais,
          locality: deleteDialog?.inventaire.lieuDit.nom,
          city: deleteDialog?.inventaire.lieuDit.commune.nom,
          department: deleteDialog?.inventaire.lieuDit.commune.departement.code,
          date: deleteDialog?.inventaire.date,
        })}
        onCancelAction={() => setDeleteDialog(null)}
        onConfirmAction={() => handleDeleteDonneeConfirmation(deleteDialog)}
      />
    </>
  );
};

export default DonneeTable;
