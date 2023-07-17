import { getEntriesResponse } from "@ou-ca/common/api/entry";
import { getInventoryResponse } from "@ou-ca/common/api/inventory";
import { Fragment, useEffect, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useInView } from "react-intersection-observer";
import { Link } from "react-router-dom";
import useApiInfiniteQuery from "../../../hooks/api/useApiInfiniteQuery";
import useApiQuery from "../../../hooks/api/useApiQuery";
import InventaireDetailsView from "../../view/InventaireDetailsView";

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
    path: "/entries",
    queryParams: {
      pageNumber: 1,
      pageSize: 1,
      inventoryId,
    },
    schema: getEntriesResponse,
  });

  const { data, fetchNextPage, hasNextPage } = useApiInfiniteQuery({
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
      {inventory && <InventaireDetailsView inventaire={inventory} />}
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
                  <li>
                    <Link className="flex justify-start gap-2" to={`/entry/${entry.id}`}>
                      <div className="flex w-12 shrink-0 justify-center">
                        <span className="badge badge-lg badge-primary badge-outline">
                          {entry.numberEstimate.nonCompte ? "?" : entry.number}
                        </span>
                      </div>
                      <span className="link link-hover link-primary capitalize font-semibold">
                        {entry.species.nomFrancais}
                      </span>
                    </Link>
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
