import { getEntriesExtendedResponse } from "@ou-ca/common/api/entry";
import { getInventoryResponse } from "@ou-ca/common/api/inventory";
import { useEffect, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useInView } from "react-intersection-observer";
import { useParams } from "react-router-dom";
import useApiInfiniteQuery from "../../../hooks/api/useApiInfiniteQuery";
import useApiQuery from "../../../hooks/api/useApiQuery";
import InventoryPageEntriesPanel from "../inventory-page-entries-panel/InventoryPageEntriesPanel";
import InventoryPagePanel from "../inventory-page-panel/InventoryPagePanel";

const InventoryPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const { id } = useParams();

  const {
    data: inventory,
    error,
    isFetching,
  } = useApiQuery(
    {
      path: `/inventories/${id!}`,
      schema: getInventoryResponse,
    },
    {
      enabled: id != null,
    }
  );

  const {
    data: entries,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = useApiInfiniteQuery(
    {
      path: "/entries",
      queryParams: {
        pageSize: 10,
        inventoryId: inventory?.id,
        extended: true,
      },
      schema: getEntriesExtendedResponse,
    },
    {
      enabled: inventory != null,
    }
  );

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView) {
      void fetchNextPage();
    }
  }, [inView, fetchNextPage]);

  if (isFetching && !inventory) {
    return (
      <div className="flex justify-center items-center h-56">
        <progress className="progress progress-primary w-56" />
      </div>
    );
  }

  if (error) {
    if (error.status === 404) {
      return <>{t("inventoryPage.inventoryNotFound")}</>;
    } else {
      return <>{t("inventoryPage.genericError")}</>;
    }
  }

  return (
    <div className="container mx-auto flex gap-10 mt-6">
      <div className="basis-1/3">
        {inventory && (
          <InventoryPagePanel
            inventory={inventory}
            isInventoryDeletionAllowed={entries?.pages?.[0] != null && entries.pages[0].meta.count === 0}
          />
        )}
      </div>
      <div className="basis-2/3">
        {inventory != null && (
          <>
            <InventoryPageEntriesPanel
              inventoryId={inventory.id}
              entries={entries}
              onCreateEntrySettled={async () => {
                await refetch();
              }}
              onUpdateEntrySettled={async () => {
                await refetch();
              }}
              onDeleteEntrySettled={async () => {
                await refetch();
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
