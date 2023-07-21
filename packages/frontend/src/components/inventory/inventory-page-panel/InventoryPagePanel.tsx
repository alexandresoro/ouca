import { getInventoriesResponse } from "@ou-ca/common/api/inventory";
import { type InventoryExtended } from "@ou-ca/common/entities/inventory";
import { ChevronLeft, ChevronRight } from "@styled-icons/boxicons-regular";
import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { z } from "zod";
import useApiQuery from "../../../hooks/api/useApiQuery";
import InventoryMap from "../inventory-map/InventoryMap";
import InventorySummaryPanel from "../inventory-summary-panel/InventorySummaryPanel";

type InventoryPagePanelProps = {
  inventory: InventoryExtended;
};

const InventoryPagePanel: FunctionComponent<InventoryPagePanelProps> = ({ inventory }) => {
  const { t } = useTranslation();

  const { data: inventoryCountData } = useApiQuery({
    path: "/inventories",
    queryParams: {
      pageNumber: 1,
      pageSize: 1,
    },
    schema: getInventoriesResponse,
  });

  const totalInventories = inventoryCountData?.meta.count;

  const { data: inventoryIndex } = useApiQuery(
    {
      path: `/inventories/${inventory.id}/index`,
      queryParams: {
        orderBy: "creationDate",
        sortOrder: "desc",
      },
      schema: z.number(),
    },
    {
      enabled: inventory != null,
    }
  );

  const previousInventoryIndex =
    inventoryIndex != null && totalInventories != null && inventoryIndex < totalInventories
      ? inventoryIndex + 1
      : undefined;
  const nextInventoryIndex = inventoryIndex != null && inventoryIndex > 1 ? inventoryIndex - 1 : undefined;

  const { data: previousInventoryData } = useApiQuery(
    {
      path: "/inventories",
      queryParams: {
        pageNumber: previousInventoryIndex,
        pageSize: 1,
        orderBy: "creationDate",
        sortOrder: "desc",
      },
      schema: getInventoriesResponse,
    },
    {
      enabled: previousInventoryIndex != null,
      staleTime: 10000,
    }
  );

  const { data: nextInventoryData } = useApiQuery(
    {
      path: "/inventories",
      queryParams: {
        pageNumber: nextInventoryIndex,
        pageSize: 1,
        orderBy: "creationDate",
        sortOrder: "desc",
      },
      schema: getInventoriesResponse,
    },
    {
      enabled: nextInventoryIndex != null,
      staleTime: 10000,
    }
  );

  const hasPreviousInventory = previousInventoryIndex != null && previousInventoryData?.data?.[0] != null;
  const hasNextInventory = nextInventoryIndex != null && nextInventoryData?.data?.[0] != null;

  return (
    <>
      <div className="flex pb-4 items-center justify-between">
        <h3 className="text-2xl font-normal">{t("observationDetails.inventoryTitle")}</h3>
        <div className="flex items-center gap-4">
          <span className="badge badge-md badge-accent">
            {t("displayData.dataId")} {inventory?.id}
          </span>
          <div className="flex gap-2">
            <div
              className="tooltip tooltip-bottom"
              data-tip={hasPreviousInventory ? t("inventoryPage.previousInventory") : undefined}
            >
              <Link
                className={`btn btn-sm btn-square ${hasPreviousInventory ? "btn-accent" : "btn-disabled"}`}
                to={`../${previousInventoryData?.data?.[0].id as string}`}
                tabIndex={hasPreviousInventory ? 0 : -1}
                relative="path"
              >
                <ChevronLeft className="h-6" />
              </Link>
            </div>
            <div
              className="tooltip tooltip-bottom"
              data-tip={hasNextInventory ? t("inventoryPage.nextInventory") : undefined}
            >
              <Link
                className={`btn btn-sm btn-square ${hasNextInventory ? "btn-accent" : "btn-disabled"}`}
                to={`../${nextInventoryData?.data?.[0].id as string}`}
                tabIndex={hasNextInventory ? 0 : -1}
                relative="path"
              >
                <ChevronRight className="h-6" />
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <InventorySummaryPanel inventory={inventory} />
        <InventoryMap key={inventory.id} inventory={inventory} />
      </div>
    </>
  );
};

export default InventoryPagePanel;
