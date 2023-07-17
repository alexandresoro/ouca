import { type FunctionComponent } from "react";
import InventoryDetails from "../../../inventory/inventory-details/InventoryDetails";
import EntryDetailsForm from "../../entry-details/EntryDetailsForm";

type EntryStepContainerProps = { existingInventoryId: string };

const EntryStepContainer: FunctionComponent<EntryStepContainerProps> = ({ existingInventoryId }) => {
  const newEntryKey = `new-entry-inventory-${existingInventoryId ?? ""}`;

  return (
    <div className="container mx-auto flex gap-10 pt-4">
      <div className="basis-1/3">
        <InventoryDetails inventoryId={existingInventoryId} />
      </div>
      <div className="basis-2/3">
        <EntryDetailsForm key={newEntryKey} isNewEntry={true} existingInventoryId={existingInventoryId} />
      </div>
    </div>
  );
};

export default EntryStepContainer;
