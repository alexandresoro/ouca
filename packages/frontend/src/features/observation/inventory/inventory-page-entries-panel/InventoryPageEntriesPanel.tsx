import { useNotifications } from "@hooks/useNotifications";
import type { Entry, EntryExtended } from "@ou-ca/common/api/entities/entry";
import type { UpsertEntryInput, getEntriesExtendedResponse } from "@ou-ca/common/api/entry";
import { Plus } from "@styled-icons/boxicons-regular";
import { type InfiniteData, useQueryClient } from "@tanstack/react-query";
import { Fragment, type FunctionComponent, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import type { z } from "zod";
import DeletionConfirmationDialog from "../../../../components/common/DeletionConfirmationDialog";
import { useApiEntryDelete, useApiEntryUpdate } from "../../../../services/api/entry/api-entry-queries";
import EntryDetailsDialogContainer from "../../entry/entry-details-dialog-container/EntryDetailsDialogContainer";
import { ENTRY_STEP } from "../../entry/new-entry-page/new-entry-hash-step-mapper";
import UpdateEntryDialogContainer from "../../entry/update-entry-dialog-container/UpdateEntryDialogContainer";
import InventoryPageEntryElement from "../inventory-page-entry-element/InventoryPageEntryElement";

type InventoryPageEntriesPanelProps = {
  inventoryId: string;
  entries: InfiniteData<z.infer<typeof getEntriesExtendedResponse>> | undefined;
  onCreateEntrySettled?: () => void | Promise<void>;
  onUpdateEntrySettled?: () => void | Promise<void>;
  onDeleteEntrySettled?: () => void | Promise<void>;
};

const InventoryPageEntriesPanel: FunctionComponent<InventoryPageEntriesPanelProps> = ({
  inventoryId,
  entries,
  onCreateEntrySettled,
  onUpdateEntrySettled,
  onDeleteEntrySettled,
}) => {
  const { t } = useTranslation();

  const { displayNotification } = useNotifications();

  const queryClient = useQueryClient();

  const [viewEntryDialogEntry, setViewEntryDialogEntry] = useState<EntryExtended | undefined>();
  const [updateEntryDialogEntry, setUpdateEntryDialogEntry] = useState<Entry | null>(null);
  const [deleteEntryDialogEntry, setDeleteEntryDialogEntry] = useState<EntryExtended | null>(null);

  const { mutate: updateEntry } = useApiEntryUpdate({
    onSettled: onUpdateEntrySettled,
    onSuccess: (updatedEntry) => {
      queryClient.setQueryData(["API", `/entries/${updatedEntry.id}`], updatedEntry);
      setUpdateEntryDialogEntry(null);
      displayNotification({
        type: "success",
        message: t("inventoryForm.entries.updateSuccess"),
      });
    },
    onError: () => {
      displayNotification({
        type: "error",
        message: t("inventoryForm.entries.updateError"),
      });
    },
  });

  const { mutate: deleteEntry } = useApiEntryDelete({
    onSettled: onDeleteEntrySettled,
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

  const handleSubmitUpdateExistingEntryForm = (entryFormData: UpsertEntryInput, entryId: string) => {
    updateEntry({
      entryId,
      body: entryFormData,
    });
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
        <Link
          to={`/create-new?${new URLSearchParams({ inventoryId }).toString()}#${ENTRY_STEP.id}`}
          className="btn btn-sm btn-secondary uppercase"
        >
          <Plus className="w-5 h-5" />
          {t("inventoryPage.entriesPanel.addNewEntry")}
        </Link>
      </div>
      <ul className="flex flex-col justify-evenly gap-x-4 gap-y-2 mb-4">
        {entries?.pages.map((page) => {
          return (
            <Fragment key={page.meta.pageNumber}>
              {page.data.map((entry) => {
                return (
                  <li key={entry.id}>
                    <InventoryPageEntryElement
                      entry={entry}
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
