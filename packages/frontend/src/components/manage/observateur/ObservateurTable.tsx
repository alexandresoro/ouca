import { type EntitiesWithLabelOrderBy } from "@ou-ca/common/api/common/entitiesSearchParams";
import { getObserversExtendedResponse } from "@ou-ca/common/api/observer";
import { type ObserverExtended } from "@ou-ca/common/entities/observer";
import { Fragment, useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useApiInfiniteQuery from "../../../hooks/api/useApiInfiniteQuery";
import useApiMutation from "../../../hooks/api/useApiMutation";
import usePaginationParams from "../../../hooks/usePaginationParams";
import useSnackbar from "../../../hooks/useSnackbar";
import InfiniteTable from "../../common/styled/table/InfiniteTable";
import TableSortLabel from "../../common/styled/table/TableSortLabel";
import DeletionConfirmationDialog from "../common/DeletionConfirmationDialog";
import ManageEntitiesHeader from "../common/ManageEntitiesHeader";
import TableCellActionButtons from "../common/TableCellActionButtons";

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

  const { query, setQuery, orderBy, setOrderBy, sortOrder, setSortOrder } =
    usePaginationParams<EntitiesWithLabelOrderBy>();

  const [dialogObservateur, setDialogObservateur] = useState<ObserverExtended | null>(null);

  const { data, fetchNextPage, hasNextPage, refetch } = useApiInfiniteQuery({
    path: "/observers",
    queryParams: {
      q: query,
      pageSize: 10,
      orderBy,
      sortOrder,
      extended: true,
    },
    schema: getObserversExtendedResponse,
  });

  const { mutate } = useApiMutation(
    { method: "DELETE" },
    {
      onSettled: async () => {
        await refetch();
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

  const handleEditObservateur = (id: string) => {
    if (id) {
      navigate(`edit/${id}`);
    }
  };

  const handleDeleteObservateur = (observateur: ObserverExtended | null) => {
    if (observateur) {
      setDialogObservateur(observateur);
    }
  };

  const handleDeleteObservateurConfirmation = (observateur: ObserverExtended | null) => {
    if (observateur) {
      setDialogObservateur(null);
      mutate({ path: `/observers/${observateur.id}` });
    }
  };

  const handleRequestSort = (sortingColumn: EntitiesWithLabelOrderBy) => {
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
        count={data?.pages?.[0].meta.count}
      />
      <InfiniteTable
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
        tableRows={data?.pages.map((page) => {
          return (
            <Fragment key={page.meta.pageNumber}>
              {page.data.map((observateur) => {
                return (
                  <tr className="hover:bg-base-200" key={observateur?.id}>
                    <td>{observateur.libelle}</td>
                    <td>{observateur.entriesCount}</td>
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
            </Fragment>
          );
        })}
        enableScroll={hasNextPage}
        onMoreRequested={() => fetchNextPage()}
      />
      <DeletionConfirmationDialog
        open={!!dialogObservateur}
        messageContent={t("deleteObserverDialogMsg", {
          name: dialogObservateur?.libelle,
        })}
        impactedItemsMessage={t("deleteObserverDialogMsgImpactedData", {
          nbOfObservations: dialogObservateur?.entriesCount ?? 0,
        })}
        onCancelAction={() => setDialogObservateur(null)}
        onConfirmAction={() => handleDeleteObservateurConfirmation(dialogObservateur)}
      />
    </>
  );
};

export default ObservateurTable;
