import { getEntriesResponse } from "@ou-ca/common/api/entry";
import { Fragment, useEffect, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useInView } from "react-intersection-observer";
import useApiInfiniteQuery from "../../../hooks/api/useApiInfiniteQuery";

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
      {entries?.pages.map((page) => {
        return (
          <Fragment key={page.meta.pageNumber}>
            {page.data.map((entry) => {
              return <li>{JSON.stringify(entry)}</li>;
            })}
          </Fragment>
        );
      })}
      {hasNextPage && (
        <button ref={ref} type="button" className="btn btn-xs btn-link no-underline" onClick={() => fetchNextPage()}>
          {t("infiniteScroll.more")}
        </button>
      )}
    </>
  );
};

export default InventoryPageEntriesPanel;
