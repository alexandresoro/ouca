import { FloatingArrow, arrow, autoUpdate, offset, shift, useFloating, type VirtualElement } from "@floating-ui/react";
import { Menu } from "@headlessui/react";
import { getInventoriesResponse, type UpsertInventoryInput } from "@ou-ca/common/api/inventory";
import { type InventoryExtended } from "@ou-ca/common/entities/inventory";
import {
  ChevronLeft,
  ChevronRight,
  CopyAlt,
  DotsHorizontalRounded,
  EditAlt,
  Trash,
} from "@styled-icons/boxicons-regular";
import { useQueryClient } from "@tanstack/react-query";
import { useRef, useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useApiInventoryDelete, useApiInventoryUpdate } from "../../../hooks/api/queries/api-inventory-queries";
import useApiQuery from "../../../hooks/api/useApiQuery";
import useSnackbar from "../../../hooks/useSnackbar";
import DeletionConfirmationDialog from "../../manage/common/DeletionConfirmationDialog";
import InventoryEditDialogContainer from "../inventory-edit-dialog-container/InventoryEditDialogContainer";
import InventoryMap from "../inventory-map/InventoryMap";
import InventorySummaryPanel from "../inventory-summary-panel/InventorySummaryPanel";

type InventoryPagePanelProps = {
  inventory: InventoryExtended;
  isInventoryDeletionAllowed?: boolean;
};

const InventoryPagePanel: FunctionComponent<InventoryPagePanelProps> = ({ inventory, isInventoryDeletionAllowed }) => {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const { displayNotification } = useSnackbar();

  const queryClient = useQueryClient();

  const [deleteDialog, setDeleteDialog] = useState<InventoryExtended | null>(null);

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

  const { data: previousInventoryData, isFetching: isFetchingPrevious } = useApiQuery(
    {
      queryKeyPrefix: "indexInventory",
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
      staleTime: 30000,
    }
  );

  const { data: nextInventoryData, isFetching: isFetchingNext } = useApiQuery(
    {
      queryKeyPrefix: "indexInventory",
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
      staleTime: 30000,
    }
  );

  const { mutate: updateInventory } = useApiInventoryUpdate({
    onSuccess: (updatedInventory) => {
      queryClient.setQueryData(["API", `/inventories/${updatedInventory.id}`], updatedInventory);
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

  const { mutate: deleteInventory } = useApiInventoryDelete({
    onSuccess: async () => {
      displayNotification({
        type: "success",
        message: t("inventoryForm.deleteSuccess"),
      });
      setDeleteDialog(null);
      await queryClient.invalidateQueries(["API", "indexInventory"]);
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

  const handleInventoryUpdate = (inventoryFormData: UpsertInventoryInput, inventoryId: string) => {
    updateInventory({
      inventoryId,
      body: inventoryFormData,
    });
  };

  const previousInventoryId = previousInventoryData?.data?.[0].id ?? null;
  const nextInventoryId = nextInventoryData?.data?.[0].id ?? null;

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
              className="z-10 flex flex-col gap-1.5 p-1.5 outline-none shadow-md ring-2 ring-primary-focus bg-base-100 dark:bg-base-300 rounded-lg w-max"
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
                    className={`btn btn-xs text-primary ${active ? "bg-opacity-20 bg-base-content" : "btn-ghost"}`}
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
                    className={`btn btn-xs text-primary ${active ? "bg-opacity-20 bg-base-content" : "btn-ghost"}`}
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
                      className={`btn btn-xs text-error ${active ? "bg-opacity-20 bg-base-content" : "btn-ghost"}`}
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
                  hasPreviousInventory && !isFetchingPrevious ? "btn-primary" : "btn-disabled"
                }`}
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
                  hasNextInventory && !isFetchingNext ? "btn-primary" : "btn-disabled"
                }`}
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
        onConfirmAction={() => deleteInventory({ inventoryId: inventory.id })}
      />
    </>
  );
};

export default InventoryPagePanel;
