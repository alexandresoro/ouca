import { getEntriesResponse } from "@ou-ca/common/api/entry";
import { Fragment, useEffect, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useInView } from "react-intersection-observer";
import useApiInfiniteQuery from "../../../hooks/api/useApiInfiniteQuery";
import InventoryPageEntryElement from "../inventory-page-entry-element/InventoryPageEntryElement";

type InventoryPageEntriesPanelProps = {
  inventoryId: string;
};

const InventoryPageEntriesPanel: FunctionComponent<InventoryPageEntriesPanelProps> = ({ inventoryId }) => {
  const { t } = useTranslation();

  const { ref, inView } = useInView();

  const {
    data: entries,
    fetchNextPage,
    hasNextPage,
  } = useApiInfiniteQuery({
    path: "/entries",
    queryParams: {
      pageSize: 10,
      inventoryId,
    },
    schema: getEntriesResponse,
  });

  useEffect(() => {
    if (inView) {
      void fetchNextPage();
    }
  }, [inView, fetchNextPage]);

  return (
    <>
      <div className="flex items-center gap-3 py-4">
        <h3 className="text-xl font-normal">
          {t("inventoryPage.entriesPanel.title", { count: entries?.pages[0].meta.count })}
        </h3>
        <span className="badge badge-primary badge-outline font-semibold">{entries?.pages[0].meta.count}</span>
      </div>
      <ul className="flex flex-wrap justify-evenly gap-x-4 gap-y-2">
        {entries?.pages.map((page) => {
          return (
            <Fragment key={page.meta.pageNumber}>
              {page.data.map((entry) => {
                return (
                  <li key={entry.id}>
                    <InventoryPageEntryElement entry={entry} />
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
    </>
  );
};

export default InventoryPageEntriesPanel;
