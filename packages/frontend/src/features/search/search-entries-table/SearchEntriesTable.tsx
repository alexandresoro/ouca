import InfiniteTable from "@components/base/table/InfiniteTable";
import TableSortLabel from "@components/base/table/TableSortLabel";
import useApiInfiniteQuery from "@hooks/api/useApiInfiniteQuery";
import { useNotifications } from "@hooks/useNotifications";
import usePaginationParams from "@hooks/usePaginationParams";
import type { Entry } from "@ou-ca/common/api/entities/entry";
import { type EntriesOrderBy, type UpsertEntryInput, getEntriesResponse } from "@ou-ca/common/api/entry";
import { useApiEntryDelete, useApiEntryUpdate } from "@services/api/entry/api-entry-queries";
import { useQueryClient } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { Fragment, type FunctionComponent, useState } from "react";
import { useTranslation } from "react-i18next";
import DeleteEntryConfirmationDialog from "../../observation/entry/delete-entry-confirmation-dialog/DeleteEntryConfirmationDialog";
import EntryDetailsDialogContainer from "../../observation/entry/entry-details-dialog-container/EntryDetailsDialogContainer";
import UpdateEntryDialogContainer from "../../observation/entry/update-entry-dialog-container/UpdateEntryDialogContainer";
import { searchEntriesCriteriaAtom } from "../searchEntriesCriteriaAtom";
import SearchEntriesTableRow from "./SearchEntriesTableRow";

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
] as const;

type SearchEntriesTableProps = {
  onEntryUpdated?: (entryId: string) => void;
  onEntryDeleted?: () => void;
};

const SearchEntriesTable: FunctionComponent<SearchEntriesTableProps> = ({ onEntryUpdated, onEntryDeleted }) => {
  const { t } = useTranslation();

  const { orderBy, setOrderBy, sortOrder, setSortOrder } = usePaginationParams<EntriesOrderBy>({
    orderBy: "date",
    sortOrder: "desc",
  });

  const queryClient = useQueryClient();

  const [deleteDialog, setDeleteDialog] = useState<Entry | null>(null);
  const [viewEntryDialogEntry, setViewEntryDialogEntry] = useState<Entry | undefined>();
  const [updateEntryDialogEntry, setUpdateEntryDialogEntry] = useState<Entry | null>(null);

  const { displayNotification } = useNotifications();

  const searchCriteria = useAtomValue(searchEntriesCriteriaAtom);

  const { data, refetch, fetchNextPage, hasNextPage } = useApiInfiniteQuery(
    {
      path: "/entries",
      queryParams: {
        pageSize: 10,
        orderBy,
        sortOrder,
        ...searchCriteria,
      },
      schema: getEntriesResponse,
    },
    {
      staleTime: Number.POSITIVE_INFINITY,
      refetchOnMount: "always",
    },
  );

  const { mutate: updateEntry } = useApiEntryUpdate({
    onSettled: async () => {
      // FIXME: this will only refetch the current filter,
      // but possibly not ones that are cached and not refetched
      await refetch();
    },
    onSuccess: (updatedEntry) => {
      queryClient.setQueryData(["API", `/entries/${updatedEntry.id}`], updatedEntry);
      setUpdateEntryDialogEntry(null);
      displayNotification({
        type: "success",
        message: t("inventoryForm.entries.updateSuccess"),
      });
      onEntryUpdated?.(updatedEntry.id);
    },
    onError: () => {
      displayNotification({
        type: "error",
        message: t("inventoryForm.entries.updateError"),
      });
    },
  });

  const { mutate } = useApiEntryDelete({
    onSettled: async () => {
      await refetch();
    },
    onSuccess: () => {
      displayNotification({
        type: "success",
        message: t("deleteConfirmationMessage"),
      });
      onEntryDeleted?.();
    },
    onError: () => {
      displayNotification({
        type: "error",
        message: t("deleteErrorMessage"),
      });
    },
  });

  const handleSubmitUpdateExistingEntryForm = (entryFormData: UpsertEntryInput, entryId: string) => {
    updateEntry({
      entryId,
      body: entryFormData,
    });
  };

  const handleDeleteDonnee = (donnee: Entry | null) => {
    if (donnee) {
      setDeleteDialog(donnee);
    }
  };

  const handleDeleteDonneeConfirmation = (donnee: Entry | null) => {
    if (donnee) {
      setDeleteDialog(null);
      mutate({ entryId: donnee.id });
    }
  };

  const handleRequestSort = (sortingColumn: EntriesOrderBy) => {
    const isAsc = orderBy === sortingColumn && sortOrder === "asc";
    setSortOrder(isAsc ? "desc" : "asc");
    setOrderBy(sortingColumn);
  };

  return (
    <>
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
              {page.data.map((donnee) => {
                return (
                  <SearchEntriesTableRow
                    key={donnee.id}
                    donnee={donnee}
                    onViewAction={() => setViewEntryDialogEntry(donnee)}
                    onEditAction={() => setUpdateEntryDialogEntry(donnee)}
                    onDeleteAction={() => handleDeleteDonnee(donnee)}
                  />
                );
              })}
            </Fragment>
          );
        })}
        enableScroll={hasNextPage}
        onMoreRequested={fetchNextPage}
      />

      <DeleteEntryConfirmationDialog
        open={!!deleteDialog}
        entry={deleteDialog}
        onCancelAction={() => setDeleteDialog(null)}
        onConfirmAction={() => handleDeleteDonneeConfirmation(deleteDialog)}
      />

      <EntryDetailsDialogContainer
        entry={viewEntryDialogEntry}
        open={viewEntryDialogEntry != null}
        onClose={() => setViewEntryDialogEntry(undefined)}
      />
      <UpdateEntryDialogContainer
        entry={updateEntryDialogEntry}
        open={updateEntryDialogEntry != null}
        onClose={() => setUpdateEntryDialogEntry(null)}
        onSubmitUpdateEntryForm={handleSubmitUpdateExistingEntryForm}
      />
    </>
  );
};

export default SearchEntriesTable;
