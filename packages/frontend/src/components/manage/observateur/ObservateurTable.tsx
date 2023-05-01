import { useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useQuery } from "urql";
import { type EntitesAvecLibelleOrderBy, type Observateur } from "../../../gql/graphql";
import useApiMutation from "../../../hooks/api/useApiMutation";
import usePaginatedTableParams from "../../../hooks/usePaginatedTableParams";
import useSnackbar from "../../../hooks/useSnackbar";
import Table from "../../common/styled/table/Table";
import TableSortLabel from "../../common/styled/table/TableSortLabel";
import DeletionConfirmationDialog from "../common/DeletionConfirmationDialog";
import ManageEntitiesHeader from "../common/ManageEntitiesHeader";
import TableCellActionButtons from "../common/TableCellActionButtons";
import { PAGINATED_OBSERVATEURS_QUERY } from "./ObservateurManageQueries";

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

  const { query, setQuery, page, setPage, rowsPerPage, orderBy, setOrderBy, sortOrder, setSortOrder } =
    usePaginatedTableParams<EntitesAvecLibelleOrderBy>();

  const [dialogObservateur, setDialogObservateur] = useState<Observateur | null>(null);

  const [{ data }, reexecuteObservateurs] = useQuery({
    query: PAGINATED_OBSERVATEURS_QUERY,
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

  const { mutate } = useApiMutation(
    { method: "DELETE" },
    {
      onSettled: () => {
        reexecuteObservateurs();
      },
      onSuccess: () => {
        displayNotification({
          type: "success",
          message: t("deleteConfirmationMessage"),
        });
      },
      onError: () => {
        displayNotification({
          type: "error",
          message: t("deleteErrorMessage"),
        });
      },
    }
  );

  const { displayNotification } = useSnackbar();

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

  const handleDeleteObservateurConfirmation = (observateur: Observateur | null) => {
    if (observateur) {
      setDialogObservateur(null);
      mutate({ path: `/observer/${observateur.id}` });
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
        count={data?.observateurs?.count}
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
        tableRows={data?.observateurs?.data?.map((observateur) => {
          return (
            <tr className="hover" key={observateur?.id}>
              <td>{observateur?.libelle}</td>
              <td>{observateur?.nbDonnees}</td>
              <td align="right" className="pr-6">
                <TableCellActionButtons
                  disabled={!observateur.editable}
                  onEditClicked={() => handleEditObservateur(observateur?.id)}
                  onDeleteClicked={() => handleDeleteObservateur(observateur)}
                />
              </td>
            </tr>
          );
        })}
        page={page}
        elementsPerPage={rowsPerPage}
        count={data?.observateurs?.count}
        onPageChange={handleChangePage}
      />
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
