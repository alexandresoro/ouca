import { type UpsertInventoryInput } from "@ou-ca/common/api/inventory";
import { type FunctionComponent } from "react";
import { ENTRY_STEP, INVENTORY_STEP, type NewEntryStep } from "../new-entry-page/new-entry-hash-step-mapper";
import EntryStepContainer from "../steps/entry-step-container/EntryStepContainer";
import InventoryStepContainer from "../steps/inventory-step-container/InventoryStepContainer";

type NewEntryFormContainerProps = { currentStep: NewEntryStep; existingInventoryId?: string };

const NewEntryFormContainer: FunctionComponent<NewEntryFormContainerProps> = ({ currentStep, existingInventoryId }) => {
  const goToEntryStep = () => {
    window.location.hash = `#${ENTRY_STEP.id}`;
  };

  const handleSubmitInventoryForm = (inventoryFormData: UpsertInventoryInput, inventoryId: string | undefined) => {
    console.log(inventoryFormData, inventoryId);
    setTimeout(() => {
      goToEntryStep();
    }, 300);
  };

  return (
    <>
      {currentStep.id === INVENTORY_STEP.id && (
        <InventoryStepContainer
          existingInventoryId={existingInventoryId}
          onSubmitInventoryForm={handleSubmitInventoryForm}
        />
      )}
      {currentStep.id === ENTRY_STEP.id && existingInventoryId && (
        <EntryStepContainer existingInventoryId={existingInventoryId} />
      )}
    </>
  );
};

export default NewEntryFormContainer;
