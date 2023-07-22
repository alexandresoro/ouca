import { type UpsertInventoryInput } from "@ou-ca/common/api/inventory";
import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useApiInventoryCreate, useApiInventoryUpdate } from "../../../hooks/api/queries/api-inventory-queries";
import useSnackbar from "../../../hooks/useSnackbar";
import { queryClient } from "../../../query/query-client";
import { ENTRY_STEP, INVENTORY_STEP, type NewEntryStep } from "../new-entry-page/new-entry-hash-step-mapper";
import EntryStepContainer from "../steps/entry-step-container/EntryStepContainer";
import InventoryStepContainer from "../steps/inventory-step-container/InventoryStepContainer";

type NewEntryFormContainerProps = { currentStep: NewEntryStep; existingInventoryId?: string };

const NewEntryFormContainer: FunctionComponent<NewEntryFormContainerProps> = ({ currentStep, existingInventoryId }) => {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const { displayNotification } = useSnackbar();

  const goToEntryStep = (inventoryId: string) => {
    navigate(`/create/new?${new URLSearchParams({ inventoryId }).toString()}#${ENTRY_STEP.id}`, { replace: true });
  };

  const { mutate: updateInventory } = useApiInventoryUpdate({
    onSuccess: (updatedInventory) => {
      queryClient.setQueryData(["API", `/inventories/${updatedInventory.id}`], updatedInventory);
      displayNotification({
        type: "success",
        message: t("inventoryForm.updateSuccess"),
      });
      goToEntryStep(updatedInventory.id);
    },
    onError: () => {
      displayNotification({
        type: "error",
        message: t("inventoryForm.updateError"),
      });
    },
  });

  const { mutate: createInventory } = useApiInventoryCreate({
    onSuccess: (updatedInventory) => {
      queryClient.setQueryData(["API", `/inventories/${updatedInventory.id}`], updatedInventory);
      displayNotification({
        type: "success",
        message: t("inventoryForm.createSuccess"),
      });
      goToEntryStep(updatedInventory.id);
    },
    onError: () => {
      displayNotification({
        type: "error",
        message: t("inventoryForm.createError"),
      });
    },
  });

  const handleSubmitInventoryForm = (inventoryFormData: UpsertInventoryInput, inventoryId: string | undefined) => {
    console.log(inventoryFormData, inventoryId);
    if (inventoryId) {
      updateInventory({ inventoryId, body: inventoryFormData });
    } else {
      createInventory({ body: inventoryFormData });
    }
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
