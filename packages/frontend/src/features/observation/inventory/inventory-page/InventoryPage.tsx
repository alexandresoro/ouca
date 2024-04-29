import { useApiEntriesInfiniteQuery } from "@services/api/entry/api-entry-queries";
import { useApiInventoryQuery } from "@services/api/inventory/api-inventory-queries";
import { XCircle } from "@styled-icons/boxicons-regular";
import { FetchError } from "@utils/fetch-api";
import type { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useInView } from "react-intersection-observer";
import { useParams } from "react-router-dom";
import InventoryPageEntriesPanel from "../inventory-page-entries-panel/InventoryPageEntriesPanel";
import InventoryPagePanel from "../inventory-page-panel/InventoryPagePanel";

const InventoryPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const { id } = useParams();

  const { data: inventory, error, isLoading } = useApiInventoryQuery(id ?? null);

  const {
    data: entries,
    fetchNextPage,
    hasNextPage,
    mutate,
  } = useApiEntriesInfiniteQuery(
    {
      pageSize: 10,
      inventoryId: inventory?.id,
    },
    {
      revalidateOnMount: true,
    },
    {
      paused: inventory == null,
    },
  );

  const { ref } = useInView({
    root: document.getElementById("scrollRoot"),
    rootMargin: "0px 0px 250px 0px",
    onChange: (inView) => {
      if (inView) {
        void fetchNextPage();
      }
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-56">
        <progress className="progress progress-primary w-56" />
      </div>
    );
  }

  if (error) {
    if (error instanceof FetchError && error.status === 404) {
      return (
        <div className="container mx-auto mt-6">
          <div className="alert alert-error">
            <XCircle className="h-6" />
            {t("inventoryPage.inventoryNotFound")}
          </div>
        </div>
      );
    }
    return (
      <div className="container mx-auto mt-6">
        <div className="alert alert-error">
          <XCircle className="h-6 " />
          {t("inventoryPage.genericError")}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex gap-10 mt-6">
      <div className="basis-1/3">
        {inventory && (
          <InventoryPagePanel
            inventory={inventory}
            isInventoryDeletionAllowed={entries?.[0] != null && entries[0].meta.count === 0}
          />
        )}
      </div>
      <div className="basis-2/3">
        {inventory != null && (
          <>
            <InventoryPageEntriesPanel
              inventoryId={inventory.id}
              entries={entries ?? []}
              onUpdateEntrySettled={async () => {
                await mutate();
              }}
              onDeleteEntrySettled={async () => {
                await mutate();
              }}
            />
            {hasNextPage && (
              <button
                ref={ref}
                type="button"
                className="btn btn-xs btn-link no-underline"
                onClick={() => fetchNextPage()}
              >
                {t("infiniteScroll.more")}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default InventoryPage;
