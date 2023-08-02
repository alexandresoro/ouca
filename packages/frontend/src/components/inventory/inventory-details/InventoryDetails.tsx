import { getEntriesResponse } from "@ou-ca/common/api/entry";
import { getInventoryResponse } from "@ou-ca/common/api/inventory";
import { CopyAlt } from "@styled-icons/boxicons-regular";
import { Fragment, useEffect, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useInView } from "react-intersection-observer";
import { Link } from "react-router-dom";
import useApiInfiniteQuery from "../../../hooks/api/useApiInfiniteQuery";
import useApiQuery from "../../../hooks/api/useApiQuery";
import InventorySummaryPanel from "../inventory-summary-panel/InventorySummaryPanel";

type InventoryDetailsProps = { inventoryId: string };

const InventoryDetails: FunctionComponent<InventoryDetailsProps> = ({ inventoryId }) => {
  const { t } = useTranslation();

  const { ref, inView } = useInView();

  const { data: inventory } = useApiQuery({
    path: `/inventories/${inventoryId}`,
    queryParams: {
      extended: true,
    },
    schema: getInventoryResponse,
  });

  const { data: entriesForCount } = useApiQuery({
    queryKeyPrefix: "entriesForInventoryDetails",
    path: "/entries",
    queryParams: {
      pageNumber: 1,
      pageSize: 1,
      inventoryId,
    },
    schema: getEntriesResponse,
  });

  const { data, fetchNextPage, hasNextPage } = useApiInfiniteQuery({
    queryKeyPrefix: "entriesForInventoryDetails",
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
    <div className="flex flex-col gap-4 pb-2">
      {inventory && (
        <>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-normal">{t("observationDetails.inventoryTitle")}</h3>
            <div
              className="tooltip tooltip-bottom"
              data-tip={t("inventoryCreateNewFromExisting.createNewButtonTooltip")}
            >
              <Link
                className="btn btn-xs btn-secondary"
                to={`/create-new?${new URLSearchParams({ createFromInventory: `${inventory.id}` }).toString()}`}
              >
                <CopyAlt className="h-4" />
                {t("inventoryCreateNewFromExisting.createNewButton")}
              </Link>
            </div>
          </div>
          <InventorySummaryPanel inventory={inventory} />
        </>
      )}
      <div className="stats">
        <div className="stat px-0 pb-2">
          <div className="stat-title">
            <h3 className="text-lg font-normal">{t("inventoryDetails.entries.title")}</h3>
          </div>
          <div className="stat-value text-lg">{entriesForCount?.meta.count}</div>
        </div>
      </div>
      <ul className="flex flex-col gap-1">
        {data?.pages.map((page) => {
          return (
            <Fragment key={page.meta.pageNumber}>
              {page.data.map((entry) => {
                return (
                  <li key={entry.id}>
                    <div className="card border border-primary p-3 bg-base-200 shadow-md">
                      <div className="flex">
                        <div className="flex items-center gap-2.5 font-semibold">
                          <div className="flex flex-grow flex-shrink-0 h-7 w-7 -my-2 px-1 items-center justify-center border border-primary rounded-full">
                            <div
                              className={`flex flex-grow justify-center text-primary ${
                                entry.number != null && entry.number >= 100 ? "text-xs" : "text-sm"
                              }`}
                            >
                              {entry.numberEstimate.nonCompte ? "?" : entry.number}
                            </div>
                          </div>
                          <span>{entry.species.nomFrancais}</span>
                        </div>
                      </div>
                    </div>
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
    </div>
  );
};

export default InventoryDetails;
