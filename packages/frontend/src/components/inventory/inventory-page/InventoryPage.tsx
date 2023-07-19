import { getInventoriesResponse, getInventoryResponse } from "@ou-ca/common/api/inventory";
import { ChevronLeft, ChevronRight } from "@styled-icons/boxicons-regular";
import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useInView } from "react-intersection-observer";
import { Link, useParams } from "react-router-dom";
import { z } from "zod";
import useApiQuery from "../../../hooks/api/useApiQuery";
import StyledPanelHeader from "../../layout/StyledPanelHeader";
import InventoryPageEntriesPanel from "../inventory-page-entries-panel/InventoryPageEntriesPanel";
import InventoryPagePanel from "../inventory-page-panel/InventoryPagePanel";

const InventoryPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const { id } = useParams();

  const { ref, inView } = useInView();

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
      path: `/inventories/${id}/index`,
      queryParams: {
        orderBy: "creationDate",
        sortOrder: "desc",
      },
      schema: z.number(),
    },
    {
      enabled: id != null,
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
    <>
      <StyledPanelHeader className="flex justify-between">
        <h1 className="text-2xl font-normal">{t("newEntry.steps.inventory")}</h1>
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
      </StyledPanelHeader>
      <div className="container mx-auto flex gap-10 mt-4">
        <div className="basis-1/3">{inventory && <InventoryPagePanel inventory={inventory} />}</div>
        <div className="basis-2/3">{id && <InventoryPageEntriesPanel inventoryId={id} />}</div>
      </div>
    </>
  );
};

export default InventoryPage;
