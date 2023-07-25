import { getEntriesExtendedResponse, type UpsertEntryInput } from "@ou-ca/common/api/entry";
import { type Entry, type EntryExtended } from "@ou-ca/common/entities/entry";
import { Plus } from "@styled-icons/boxicons-regular";
import { Fragment, useEffect, useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useInView } from "react-intersection-observer";
import { useApiEntryDelete } from "../../../hooks/api/queries/api-entry-queries";
import useApiInfiniteQuery from "../../../hooks/api/useApiInfiniteQuery";
import useSnackbar from "../../../hooks/useSnackbar";
import EntryDetailsDialogContainer from "../../entry/entry-details-dialog-container/EntryDetailsDialogContainer";
import NewEntryDialogContainer from "../../entry/new-entry-dialog-container/NewEntryDialogContainer";
import UpdateEntryDialogContainer from "../../entry/update-entry-dialog-container/UpdateEntryDialogContainer";
import DeletionConfirmationDialog from "../../manage/common/DeletionConfirmationDialog";
import InventoryPageEntryElement from "../inventory-page-entry-element/InventoryPageEntryElement";

type InventoryPageEntriesPanelProps = {
  inventoryId: string;
};

const InventoryPageEntriesPanel: FunctionComponent<InventoryPageEntriesPanelProps> = ({ inventoryId }) => {
  const { t } = useTranslation();

  const { displayNotification } = useSnackbar();

  const { ref, inView } = useInView();

  const [viewEntryDialogEntry, setViewEntryDialogEntry] = useState<EntryExtended | undefined>();
  const [newEntryDialogOpen, setNewEntryDialogOpen] = useState(false);
  const [updateEntryDialogEntry, setUpdateEntryDialogEntry] = useState<Entry | null>(null);
  const [deleteEntryDialogEntry, setDeleteEntryDialogEntry] = useState<EntryExtended | null>(null);

  const {
    data: entries,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = useApiInfiniteQuery({
    path: "/entries",
    queryParams: {
      pageSize: 10,
      inventoryId,
      extended: true,
    },
    schema: getEntriesExtendedResponse,
  });

  const { mutate: deleteEntry } = useApiEntryDelete({
    onSettled: async () => {
      await refetch();
    },
    onSuccess: () => {
      setDeleteEntryDialogEntry(null);
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
  });

  useEffect(() => {
    if (inView) {
      void fetchNextPage();
    }
  }, [inView, fetchNextPage]);

  const handleSubmitNewEntryForm = (entryFormData: UpsertEntryInput) => {
    console.log("NEW ENTRY", entryFormData);
  };

  const handleSubmitUpdateExistingEntryForm = (entryFormData: UpsertEntryInput, entryId: string) => {
    console.log("UPDATE ENTRY", entryFormData, entryId);
  };

  const handleDeleteExistingEntry = (entryIdToDelete: string) => {
    deleteEntry({ entryId: entryIdToDelete });
  };

  return (
    <>
      <div className="flex items-center justify-between pb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-semibold">
            {t("inventoryPage.entriesPanel.title", { count: entries?.pages[0].meta.count })}
          </h2>
          <span className="badge badge-primary badge-outline font-semibold">{entries?.pages[0].meta.count}</span>
        </div>
        <button type="button" className="btn btn-sm btn-secondary" onClick={() => setNewEntryDialogOpen(true)}>
          <Plus className="w-5 h-5" />
          {t("inventoryPage.entriesPanel.addNewEntry")}
        </button>
      </div>
      <ul className="flex flex-col justify-evenly gap-x-4 gap-y-2">
        {entries?.pages.map((page) => {
          return (
            <Fragment key={page.meta.pageNumber}>
              {page.data.map((entry) => {
                return (
                  <li key={entry.id}>
                    <InventoryPageEntryElement
                      entry={entry}
                      onViewDetailsAction={(entry) => setViewEntryDialogEntry(entry)}
                      onEditAction={(entry) => setUpdateEntryDialogEntry(entry)}
                      onDeleteAction={(entry) => setDeleteEntryDialogEntry(entry)}
                    />
                  </li>
                );
              })}
            </Fragment>
          );
        })}
      </ul>
      {hasNextPage && (
        <button ref={ref} type="button" className="btn btn-xs btn-link no-underline" onClick={() => fetchNextPage()}>
          {t("infiniteScroll.more")}
        </button>
      )}
      <EntryDetailsDialogContainer
        entry={viewEntryDialogEntry}
        open={viewEntryDialogEntry != null}
        onClose={() => setViewEntryDialogEntry(undefined)}
      />
      <NewEntryDialogContainer
        open={newEntryDialogOpen}
        onClose={() => setNewEntryDialogOpen(false)}
        onSubmitNewEntryForm={handleSubmitNewEntryForm}
        inventoryId={inventoryId}
      />
      <UpdateEntryDialogContainer
        entry={updateEntryDialogEntry}
        open={updateEntryDialogEntry != null}
        onClose={() => setUpdateEntryDialogEntry(null)}
        onSubmitUpdateEntryForm={handleSubmitUpdateExistingEntryForm}
      />
      <DeletionConfirmationDialog
        open={deleteEntryDialogEntry != null}
        messageContent={t("deleteObservationDialogMsg", {
          species: deleteEntryDialogEntry?.species.nomFrancais,
          locality: deleteEntryDialogEntry?.inventory.locality.nom,
          city: deleteEntryDialogEntry?.inventory.locality.townName,
          department: deleteEntryDialogEntry?.inventory.locality.departmentCode,
          date: deleteEntryDialogEntry?.inventory.date,
        })}
        onCancelAction={() => setDeleteEntryDialogEntry(null)}
        onConfirmAction={() => deleteEntryDialogEntry && handleDeleteExistingEntry(deleteEntryDialogEntry.id)}
      />
    </>
  );
};

export default InventoryPageEntriesPanel;
