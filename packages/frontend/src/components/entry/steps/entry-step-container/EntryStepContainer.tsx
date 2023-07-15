import { type FunctionComponent } from "react";
import EntryDetailsForm from "../../entry-details/EntryDetailsForm";

type EntryStepContainerProps = { existingInventoryId: string };

const EntryStepContainer: FunctionComponent<EntryStepContainerProps> = ({ existingInventoryId }) => {
  const newEntryKey = `new-entry-inventory-${existingInventoryId ?? ""}`;

  return <EntryDetailsForm key={newEntryKey} isNewEntry={true} existingInventoryId={existingInventoryId} />;
};

export default EntryStepContainer;
