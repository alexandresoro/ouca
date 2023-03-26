import { useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "urql";
import { type Classe, type ClassesOrderBy } from "../../../gql/graphql";
import usePaginatedTableParams from "../../../hooks/usePaginatedTableParams";
import useSnackbar from "../../../hooks/useSnackbar";
import Table from "../../common/styled/table/Table";
import TableSortLabel from "../../common/styled/table/TableSortLabel";
import DeletionConfirmationDialog from "../common/DeletionConfirmationDialog";
import ManageEntitiesHeader from "../common/ManageEntitiesHeader";
import TableCellActionButtons from "../common/TableCellActionButtons";
import { DELETE_CLASSE, PAGINATED_CLASSES_QUERY } from "./ClasseManageQueries";

const COLUMNS = [
  {
    key: "libelle",
    locKey: "label",
  },
  {
    key: "nbEspeces",
    locKey: "numberOfSpecies",
  },
  {
    key: "nbDonnees",
    locKey: "numberOfObservations",
  },
] as const;

const ClasseTable: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { query, setQuery, page, setPage, rowsPerPage, orderBy, setOrderBy, sortOrder, setSortOrder } =
    usePaginatedTableParams<ClassesOrderBy>();

  const [dialogClasse, setDialogClasse] = useState<Classe | null>(null);

  const [{ data }, reexecuteClasses] = useQuery({
    query: PAGINATED_CLASSES_QUERY,
    variables: {
      searchParams: {
        pageNumber: page,
        pageSize: rowsPerPage,
        q: query,
      },
      orderBy,
      sortOrder,
    },
  });

  const [_, deleteClasse] = useMutation(DELETE_CLASSE);

  const { displayNotification } = useSnackbar();

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

  const handleDeleteClasseConfirmation = (classe: Classe | null) => {
    if (classe) {
      setDialogClasse(null);
      deleteClasse({
        id: classe.id,
      })
        .then(({ data, error }) => {
          reexecuteClasses();
          if (!error && data?.deleteClasse) {
            displayNotification({
              type: "success",
              message: t("deleteConfirmationMessage"),
            });
          } else {
            displayNotification({
              type: "error",
              message: t("deleteErrorMessage"),
            });
          }
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

  const handleRequestSort = (sortingColumn: ClassesOrderBy) => {
    const isAsc = orderBy === sortingColumn && sortOrder === "asc";
    setSortOrder(isAsc ? "desc" : "asc");
    setOrderBy(sortingColumn);
  };

  return (
    <>
      <ManageEntitiesHeader
        value={query}
        onChange={(e) => {
          setQuery(e.currentTarget.value);
        }}
        count={data?.classes?.count}
      />
      <Table
        tableHead={
          <>
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
        tableRows={data?.classes?.data?.map((classe) => {
          return (
            <tr className="hover" key={classe?.id}>
              <td>{classe?.libelle}</td>
              <td>{classe?.nbEspeces}</td>
              <td>{classe?.nbDonnees}</td>
              <td align="right" className="pr-6">
                <TableCellActionButtons
                  disabled={!classe.editable}
                  onEditClicked={() => handleEditClasse(classe?.id)}
                  onDeleteClicked={() => handleDeleteClasse(classe)}
                />
              </td>
            </tr>
          );
        })}
        page={page}
        elementsPerPage={rowsPerPage}
        count={data?.classes?.count}
        onPageChange={handleChangePage}
      ></Table>
      <DeletionConfirmationDialog
        open={!!dialogClasse}
        messageContent={t("deleteClassDialogMsg", {
          name: dialogClasse?.libelle,
        })}
        impactedItemsMessage={t("deleteClassDialogMsgImpactedData", {
          nbOfObservations: dialogClasse?.nbDonnees,
          nbOfSpecies: dialogClasse?.nbEspeces,
        })}
        onCancelAction={() => setDialogClasse(null)}
        onConfirmAction={() => handleDeleteClasseConfirmation(dialogClasse)}
      />
    </>
  );
};

export default ClasseTable;
