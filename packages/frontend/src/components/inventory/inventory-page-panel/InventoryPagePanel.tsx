import { FloatingArrow, arrow, autoUpdate, offset, shift, useFloating, type VirtualElement } from "@floating-ui/react";
import { Menu } from "@headlessui/react";
import { getInventoriesResponse } from "@ou-ca/common/api/inventory";
import { type InventoryExtended } from "@ou-ca/common/entities/inventory";
import { ChevronLeft, ChevronRight, DotsHorizontalRounded, EditAlt } from "@styled-icons/boxicons-regular";
import { useRef, useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { z } from "zod";
import useApiQuery from "../../../hooks/api/useApiQuery";
import InventoryEditDialogContainer from "../inventory-edit-dialog-container/InventoryEditDialogContainer";
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

  const arrowRef = useRef(null);
  const floatingMoreInventory = useFloating<HTMLButtonElement | VirtualElement>({
    middleware: [
      offset(12),
      shift({
        padding: 12,
      }),
      arrow({
        element: arrowRef,
      }),
    ],
    whileElementsMounted: autoUpdate,
  });

  const [inventoryEditDialogOpen, setInventoryEditDialogOpen] = useState<boolean>(false);

  const hasPreviousInventory = previousInventoryIndex != null && previousInventoryData?.data?.[0] != null;
  const hasNextInventory = nextInventoryIndex != null && nextInventoryData?.data?.[0] != null;

  return (
    <>
      <div className="flex pb-4 items-center justify-between">
        <div className="tooltip tooltip-bottom" data-tip={`${t("displayData.dataId")} ${inventory.id}`}>
          <h2 className="text-2xl font-semibold">{t("inventoryPage.inventoryPanel.title")}</h2>
        </div>
        <div className="flex items-center gap-4">
          <Menu>
            <Menu.Button as="div" ref={floatingMoreInventory.refs.setReference} className="flex items-center">
              {({ open }) => (
                <button type="button" className={`btn btn-xs btn-circle btn-primary ${open ? "" : "btn-outline"}`}>
                  <DotsHorizontalRounded className="h-5" />
                </button>
              )}
            </Menu.Button>
            <Menu.Items
              ref={floatingMoreInventory.refs.setFloating}
              style={{
                position: floatingMoreInventory.strategy,
                top: floatingMoreInventory.y ?? 0,
                left: floatingMoreInventory.x ?? 0,
              }}
              className="z-10 flex flex-col p-1.5 outline-none shadow-md ring-2 ring-primary-focus bg-base-100 dark:bg-base-300 rounded-lg w-max"
            >
              <FloatingArrow
                className="fill-primary"
                ref={arrowRef}
                context={floatingMoreInventory.context}
                tipRadius={2}
              />
              <Menu.Item key="edit">
                <button
                  type="button"
                  className="btn btn-sm btn-ghost text-primary"
                  onClick={() => setInventoryEditDialogOpen(true)}
                >
                  <EditAlt className="h-5" />
                  {t("aria-editButton")}
                </button>
              </Menu.Item>
            </Menu.Items>
          </Menu>
          <div className="flex gap-2">
            <div
              className="tooltip tooltip-bottom"
              data-tip={hasPreviousInventory ? t("inventoryPage.previousInventory") : undefined}
            >
              <Link
                className={`btn btn-sm btn-square ${hasPreviousInventory ? "btn-primary" : "btn-disabled"}`}
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
                className={`btn btn-sm btn-square ${hasNextInventory ? "btn-primary" : "btn-disabled"}`}
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
      <InventoryEditDialogContainer
        inventoryId={inventory.id}
        open={inventoryEditDialogOpen}
        onClose={() => setInventoryEditDialogOpen(false)}
      />
    </>
  );
};

export default InventoryPagePanel;
