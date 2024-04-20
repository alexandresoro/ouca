import { useNotifications } from "@hooks/useNotifications";
import type { UpsertEntryInput } from "@ou-ca/common/api/entry";
import type { UpsertInventoryInput } from "@ou-ca/common/api/inventory";
import { useApiEntryCreate } from "@services/api/entry/api-entry-queries";
import { useApiInventoryCreate } from "@services/api/inventory/api-inventory-queries";
import { useQueryClient } from "@tanstack/react-query";
import { type FunctionComponent, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ENTRY_STEP, INVENTORY_STEP, type NewEntryStep } from "../new-entry-page/new-entry-hash-step-mapper";
import EntryStepContainer from "../steps/entry-step-container/EntryStepContainer";
import InventoryStepContainer from "../steps/inventory-step-container/InventoryStepContainer";

type NewEntryFormContainerProps = { currentStep: NewEntryStep };

const NewEntryFormContainer: FunctionComponent<NewEntryFormContainerProps> = ({ currentStep }) => {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const [searchParams] = useSearchParams();
  const inventoryIdParam = searchParams.get("inventoryId");

  const { displayNotification } = useNotifications();

  const [entryFormKey, setEntryFormKey] = useState(0);

  const goToEntryStep = (inventoryId: string) => {
    navigate(`/create-new?${new URLSearchParams({ inventoryId }).toString()}#${ENTRY_STEP.id}`, { replace: true });
  };

  const createInventory = useApiInventoryCreate();

  const createEntry = useApiEntryCreate();

  const handleSubmitInventoryForm = (inventoryFormData: UpsertInventoryInput) => {
    createInventory({ body: inventoryFormData })
      .then(async (createdInventory) => {
        await queryClient.invalidateQueries(["API", "indexInventory"]);

        queryClient.setQueryData(["API", `/inventories/${createdInventory.id}`], createdInventory);
        displayNotification({
          type: "success",
          message: t("inventoryForm.createSuccess"),
        });
        goToEntryStep(createdInventory.id);
      })
      .catch(() => {
        displayNotification({
          type: "error",
          message: t("inventoryForm.createError"),
        });
      });
  };

  const handleSubmitEntryForm = (entryFormData: UpsertEntryInput) => {
    createEntry({ body: entryFormData })
      .then((createdEntry) => {
        queryClient.setQueryData(["API", `/entries/${createdEntry.id}`], createdEntry);
        displayNotification({
          type: "success",
          message: t("inventoryForm.entries.createSuccess"),
        });
        setEntryFormKey(new Date().getTime());
      })
      .catch(() => {
        displayNotification({
          type: "error",
          message: t("inventoryForm.entries.createError"),
        });
      })
      .finally(() => {
        void queryClient.invalidateQueries(["API", "entriesForInventoryDetails"]);
      });
  };

  return (
    <>
      {currentStep.id === INVENTORY_STEP.id && (
        <InventoryStepContainer
          fromExistingInventoryId={inventoryIdParam}
          onSubmitInventoryForm={handleSubmitInventoryForm}
        />
      )}
      {currentStep.id === ENTRY_STEP.id && inventoryIdParam && (
        <EntryStepContainer
          inventoryId={inventoryIdParam}
          entryFormKey={entryFormKey}
          onSubmitEntryForm={handleSubmitEntryForm}
        />
      )}
    </>
  );
};

export default NewEntryFormContainer;
