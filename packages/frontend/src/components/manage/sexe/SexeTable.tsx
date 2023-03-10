import { useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "urql";
import { graphql } from "../../../gql";
import { type EntitesAvecLibelleOrderBy, type Sexe } from "../../../gql/graphql";
import usePaginatedTableParams from "../../../hooks/usePaginatedTableParams";
import useSnackbar from "../../../hooks/useSnackbar";
import Table from "../../common/styled/table/Table";
import TableSortLabel from "../../common/styled/table/TableSortLabel";
import DeletionConfirmationDialog from "../common/DeletionConfirmationDialog";
import ManageEntitiesHeader from "../common/ManageEntitiesHeader";
import TableCellActionButtons from "../common/TableCellActionButtons";

const PAGINATED_QUERY = graphql(`
  query SexesTable($searchParams: SearchParams, $orderBy: EntitesAvecLibelleOrderBy, $sortOrder: SortOrder) {
    sexes(searchParams: $searchParams, orderBy: $orderBy, sortOrder: $sortOrder) {
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

const DELETE = graphql(`
  mutation DeleteSexe($id: Int!) {
    deleteSexe(id: $id)
  }
`);

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

const SexeTable: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { query, setQuery, page, setPage, rowsPerPage, orderBy, setOrderBy, sortOrder, setSortOrder } =
    usePaginatedTableParams<EntitesAvecLibelleOrderBy>();

  const [dialogSexe, setDialogSexe] = useState<Sexe | null>(null);

  const [{ data }, reexecuteSexes] = useQuery({
    query: PAGINATED_QUERY,
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

  const [_, deleteSexe] = useMutation(DELETE);

  const { displayNotification } = useSnackbar();

  const handleEditSexe = (id: number | undefined) => {
    if (id) {
      navigate(`edit/${id}`);
    }
  };

  const handleDeleteSexe = (sexe: Sexe | null) => {
    if (sexe) {
      setDialogSexe(sexe);
    }
  };

  const handleDeleteSexeConfirmation = (sexe: Sexe | null) => {
    if (sexe) {
      setDialogSexe(null);
      deleteSexe({
        id: sexe.id,
      })
        .then(({ data, error }) => {
          reexecuteSexes();
          if (!error && data?.deleteSexe) {
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

  const handleRequestSort = (sortingColumn: EntitesAvecLibelleOrderBy) => {
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
        count={data?.sexes?.count}
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
            <th align="right">{t("actions")}</th>
          </>
        }
        tableRows={data?.sexes?.data?.map((sexe) => {
          return (
            <tr className="hover" key={sexe?.id}>
              <td>{sexe?.libelle}</td>
              <td>{sexe?.nbDonnees}</td>
              <td align="right">
                <TableCellActionButtons
                  disabled={!sexe.editable}
                  onEditClicked={() => handleEditSexe(sexe?.id)}
                  onDeleteClicked={() => handleDeleteSexe(sexe)}
                />
              </td>
            </tr>
          );
        })}
        page={page}
        elementsPerPage={rowsPerPage}
        count={data?.sexes?.count ?? 0}
        onPageChange={handleChangePage}
      ></Table>
      <DeletionConfirmationDialog
        open={!!dialogSexe}
        messageContent={t("deleteGenderDialogMsg", {
          name: dialogSexe?.libelle,
        })}
        impactedItemsMessage={t("deleteGenderDialogMsgImpactedData", {
          nbOfObservations: dialogSexe?.nbDonnees,
        })}
        onCancelAction={() => setDialogSexe(null)}
        onConfirmAction={() => handleDeleteSexeConfirmation(dialogSexe)}
      />
    </>
  );
};

export default SexeTable;
