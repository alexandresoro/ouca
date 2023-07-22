import { type UpsertInventoryInput } from "@ou-ca/common/api/inventory";
import { type FunctionComponent } from "react";
import InventoryFormWithMap from "../../../inventory/inventory-form-with-map/InventoryFormWithMap";

type InventoryEditContainerProps = {
  existingInventoryId?: string;
  onSubmitInventoryForm?: (inventoryFormData: UpsertInventoryInput, inventoryId: string | undefined) => void;
};

const InventoryEditContainer: FunctionComponent<InventoryEditContainerProps> = ({
  existingInventoryId,
  onSubmitInventoryForm,
}) => {
  return (
    <InventoryFormWithMap existingInventoryId={existingInventoryId} onSubmitInventoryForm={onSubmitInventoryForm} />
  );
};

export default InventoryEditContainer;
