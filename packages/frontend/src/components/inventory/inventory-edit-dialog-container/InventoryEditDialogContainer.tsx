import { Dialog } from "@headlessui/react";
import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import InventoryFormWithMap from "../inventory-form-with-map/InventoryFormWithMap";

type InventoryEditDialogContainerProps = {
  inventoryId: string;
  open: boolean;
  onClose: (value: boolean) => void;
};

const InventoryEditDialogContainer: FunctionComponent<InventoryEditDialogContainerProps> = ({
  inventoryId,
  open,
  onClose,
}) => {
  const { t } = useTranslation();

  return (
    <Dialog className={`modal ${open ? "modal-open" : ""}`} open={open} onClose={onClose}>
      <Dialog.Panel className="modal-box max-w-7xl">
        <Dialog.Title className="text-2xl font-semibold py-4 first-letter:uppercase">
          {t("inventoryPage.inventoryEdition")}
        </Dialog.Title>
        <InventoryFormWithMap existingInventoryId={inventoryId} />
      </Dialog.Panel>
    </Dialog>
  );
};

export default InventoryEditDialogContainer;
