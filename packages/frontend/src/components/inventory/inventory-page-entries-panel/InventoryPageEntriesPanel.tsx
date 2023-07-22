import { getEntriesExtendedResponse } from "@ou-ca/common/api/entry";
import { type EntryExtended } from "@ou-ca/common/entities/entry";
import { Plus } from "@styled-icons/boxicons-regular";
import { Fragment, useEffect, useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useInView } from "react-intersection-observer";
import useApiInfiniteQuery from "../../../hooks/api/useApiInfiniteQuery";
import EntryDetailsDialogContainer from "../../entry/entry-details-dialog-container/EntryDetailsDialogContainer";
import NewEntryDialogContainer from "../../entry/new-entry-dialog-container/NewEntryDialogContainer";
import InventoryPageEntryElement from "../inventory-page-entry-element/InventoryPageEntryElement";

type InventoryPageEntriesPanelProps = {
  inventoryId: string;
};

const InventoryPageEntriesPanel: FunctionComponent<InventoryPageEntriesPanelProps> = ({ inventoryId }) => {
  const { t } = useTranslation();

  const { ref, inView } = useInView();

  const [viewEntryDialogEntry, setViewEntryDialogEntry] = useState<EntryExtended | undefined>();
  const [newEntryDialogOpen, setNewEntryDialogOpen] = useState(false);

  const {
    data: entries,
    fetchNextPage,
    hasNextPage,
  } = useApiInfiniteQuery({
    path: "/entries",
    queryParams: {
      pageSize: 10,
      inventoryId,
      extended: true,
    },
    schema: getEntriesExtendedResponse,
  });

  useEffect(() => {
    if (inView) {
      void fetchNextPage();
    }
  }, [inView, fetchNextPage]);

  return (
    <>
      <div className="flex items-center justify-between pb-6">
        <div className="flex items-center gap-3">
          <h3 className="text-2xl font-semibold">
            {t("inventoryPage.entriesPanel.title", { count: entries?.pages[0].meta.count })}
          </h3>
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
        inventoryId={inventoryId}
        open={newEntryDialogOpen}
        onClose={() => setNewEntryDialogOpen(false)}
      />
    </>
  );
};

export default InventoryPageEntriesPanel;
