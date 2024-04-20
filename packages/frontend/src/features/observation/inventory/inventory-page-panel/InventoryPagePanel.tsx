import { FloatingArrow, type VirtualElement, arrow, autoUpdate, offset, shift, useFloating } from "@floating-ui/react";
import { Menu } from "@headlessui/react";
import { useNotifications } from "@hooks/useNotifications";
import type { Inventory } from "@ou-ca/common/api/entities/inventory";
import type { UpsertInventoryInput } from "@ou-ca/common/api/inventory";
import {
  useApiInventoriesQuery,
  useApiInventoryDelete,
  useApiInventoryIndex,
  useApiInventoryUpdate,
} from "@services/api/inventory/api-inventory-queries";
import {
  ChevronLeft,
  ChevronRight,
  CopyAlt,
  DotsHorizontalRounded,
  EditAlt,
  Trash,
} from "@styled-icons/boxicons-regular";
import { type FunctionComponent, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import DeletionConfirmationDialog from "../../../../components/common/DeletionConfirmationDialog";
import InventoryEditDialogContainer from "../inventory-edit-dialog-container/InventoryEditDialogContainer";
import InventoryMap from "../inventory-map/InventoryMap";
import InventorySummaryPanel from "../inventory-summary-panel/InventorySummaryPanel";

type InventoryPagePanelProps = {
  inventory: Inventory;
  isInventoryDeletionAllowed?: boolean;
};

const InventoryPagePanel: FunctionComponent<InventoryPagePanelProps> = ({ inventory, isInventoryDeletionAllowed }) => {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const { displayNotification } = useNotifications();

  const [deleteDialog, setDeleteDialog] = useState<Inventory | null>(null);

  const { data: inventoryCountData } = useApiInventoriesQuery({
    pageNumber: 1,
    pageSize: 1,
  });

  const totalInventories = inventoryCountData?.meta.count;

  const { data: inventoryIndex } = useApiInventoryIndex(inventory.id, {
    orderBy: "creationDate",
    sortOrder: "desc",
  });

  const previousInventoryIndex =
    inventoryIndex != null && totalInventories != null && inventoryIndex < totalInventories
      ? inventoryIndex + 1
      : undefined;
  const nextInventoryIndex = inventoryIndex != null && inventoryIndex > 1 ? inventoryIndex - 1 : undefined;

  const { data: previousInventoryData, isValidating: isValidatingPrevious } = useApiInventoriesQuery(
    {
      pageNumber: previousInventoryIndex,
      pageSize: 1,
      orderBy: "creationDate",
      sortOrder: "desc",
    },
    {},
    {
      paused: previousInventoryIndex == null,
    },
  );

  const { data: nextInventoryData, isValidating: isValidatingNext } = useApiInventoriesQuery(
    {
      pageNumber: nextInventoryIndex,
      pageSize: 1,
      orderBy: "creationDate",
      sortOrder: "desc",
    },
    {},
    {
      paused: nextInventoryIndex == null,
    },
  );

  const { trigger: triggerUpdateInventory } = useApiInventoryUpdate(inventory.id, {
    onSuccess: () => {
      displayNotification({
        type: "success",
        message: t("inventoryForm.updateSuccess"),
      });
      setInventoryEditDialogOpen(false);
    },
    onError: () => {
      displayNotification({
        type: "error",
        message: t("inventoryForm.updateError"),
      });
    },
  });

  const { trigger: triggerDeleteInventory } = useApiInventoryDelete(inventory.id, {
    onSuccess: () => {
      displayNotification({
        type: "success",
        message: t("inventoryForm.deleteSuccess"),
      });
      setDeleteDialog(null);
      if (previousInventoryId != null) {
        navigate(`../${previousInventoryId}`, { replace: true, relative: "path" });
      } else if (nextInventoryId != null) {
        navigate(`../${nextInventoryId}`, { replace: true, relative: "path" });
      } else {
        navigate("/", { replace: true });
      }
    },
    onError: () => {
      displayNotification({
        type: "error",
        message: t("inventoryForm.deleteError"),
      });
    },
  });

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

  const handleInventoryUpdate = async (inventoryFormData: UpsertInventoryInput) => {
    await triggerUpdateInventory({
      body: inventoryFormData,
    });
  };

  const previousInventoryId = previousInventoryData?.data?.[0]?.id ?? null;
  const nextInventoryId = nextInventoryData?.data?.[0]?.id ?? null;

  const hasPreviousInventory = previousInventoryIndex != null && previousInventoryId != null;
  const hasNextInventory = nextInventoryIndex != null && nextInventoryId != null;

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
              className="z-10 flex flex-col gap-1.5 p-1.5 outline-none shadow-md ring-2 ring-primary bg-base-100 dark:bg-base-300 rounded-lg w-max"
            >
              <FloatingArrow
                className="fill-primary"
                ref={arrowRef}
                context={floatingMoreInventory.context}
                tipRadius={2}
              />
              <Menu.Item key="edit">
                {({ active }) => (
                  <button
                    type="button"
                    className={`btn btn-xs text-primary uppercase ${
                      active ? "bg-opacity-20 bg-base-content" : "btn-ghost"
                    }`}
                    onClick={() => setInventoryEditDialogOpen(true)}
                  >
                    <EditAlt className="h-5" />
                    {t("inventoryPage.inventoryPanel.edit")}
                  </button>
                )}
              </Menu.Item>
              <Menu.Item key="createNewFrom">
                {({ active }) => (
                  <Link
                    className={`btn btn-xs text-primary uppercase ${
                      active ? "bg-opacity-20 bg-base-content" : "btn-ghost"
                    }`}
                    to={`/create-new?${new URLSearchParams({ createFromInventory: `${inventory.id}` }).toString()}`}
                  >
                    <CopyAlt className="h-5" />
                    {t("inventoryPage.inventoryPanel.createNewFrom")}
                  </Link>
                )}
              </Menu.Item>
              {isInventoryDeletionAllowed && (
                <Menu.Item key="delete">
                  {({ active }) => (
                    <button
                      type="button"
                      className={`btn btn-xs text-error uppercase ${
                        active ? "bg-opacity-20 bg-base-content" : "btn-ghost"
                      }`}
                      onClick={() => setDeleteDialog(inventory)}
                    >
                      <Trash className="h-5" />
                      {t("inventoryPage.inventoryPanel.delete")}
                    </button>
                  )}
                </Menu.Item>
              )}
            </Menu.Items>
          </Menu>
          <div className="flex gap-2">
            <div
              className="tooltip tooltip-bottom"
              data-tip={hasPreviousInventory ? t("inventoryPage.previousInventory") : undefined}
            >
              <Link
                className={`btn btn-sm btn-square ${
                  hasPreviousInventory && !isValidatingPrevious ? "btn-primary" : "btn-disabled"
                }`}
                // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
                to={`../${previousInventoryId as string}`}
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
                className={`btn btn-sm btn-square ${
                  hasNextInventory && !isValidatingNext ? "btn-primary" : "btn-disabled"
                }`}
                // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
                to={`../${nextInventoryId as string}`}
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
        <InventoryMap inventory={inventory} />
      </div>
      <InventoryEditDialogContainer
        inventory={inventory}
        open={inventoryEditDialogOpen}
        onClose={() => setInventoryEditDialogOpen(false)}
        onInventoryUpdate={handleInventoryUpdate}
      />
      <DeletionConfirmationDialog
        open={!!deleteDialog}
        messageContent={t("deleteInventoryDialogMsg")}
        onCancelAction={() => setDeleteDialog(null)}
        onConfirmAction={() => triggerDeleteInventory()}
      />
    </>
  );
};

export default InventoryPagePanel;
