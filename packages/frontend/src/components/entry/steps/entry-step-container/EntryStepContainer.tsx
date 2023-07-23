import { type FunctionComponent } from "react";
import InventoryDetails from "../../../inventory/inventory-details/InventoryDetails";
import EntryDetailsForm from "../../entry-details/EntryDetailsForm";

type EntryStepContainerProps = { inventoryId: string };

const EntryStepContainer: FunctionComponent<EntryStepContainerProps> = ({ inventoryId }) => {
  const newEntryKey = `new-entry-inventory-${inventoryId}`;

  return (
    <div className="container mx-auto flex gap-10 pt-4">
      <div className="basis-1/3">
        <InventoryDetails inventoryId={inventoryId} />
      </div>
      <div className="basis-2/3">
        <EntryDetailsForm key={newEntryKey} isNewEntry={true} existingInventoryId={inventoryId} />
      </div>
    </div>
  );
};

export default EntryStepContainer;
