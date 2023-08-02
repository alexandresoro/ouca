import { type UpsertEntryInput } from "@ou-ca/common/api/entry";
import { type UpsertInventoryInput } from "@ou-ca/common/api/inventory";
import { useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useApiEntryCreate } from "../../../hooks/api/queries/api-entry-queries";
import { useApiInventoryCreate } from "../../../hooks/api/queries/api-inventory-queries";
import useSnackbar from "../../../hooks/useSnackbar";
import { queryClient } from "../../../query/query-client";
import { ENTRY_STEP, INVENTORY_STEP, type NewEntryStep } from "../new-entry-page/new-entry-hash-step-mapper";
import EntryStepContainer from "../steps/entry-step-container/EntryStepContainer";
import InventoryStepContainer from "../steps/inventory-step-container/InventoryStepContainer";

type NewEntryFormContainerProps = { currentStep: NewEntryStep };

const NewEntryFormContainer: FunctionComponent<NewEntryFormContainerProps> = ({ currentStep }) => {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const inventoryIdParam = searchParams.get("inventoryId") ?? undefined;

  const { displayNotification } = useSnackbar();

  const [entryFormKey, setEntryFormKey] = useState(0);

  const goToEntryStep = (inventoryId: string) => {
    navigate(`/create-new?${new URLSearchParams({ inventoryId }).toString()}#${ENTRY_STEP.id}`, { replace: true });
  };

  const { mutate: createInventory } = useApiInventoryCreate({
    onSuccess: async (updatedInventory) => {
      queryClient.setQueryData(["API", `/inventories/${updatedInventory.id}`], updatedInventory);
      await queryClient.invalidateQueries(["API", "indexInventory"]);
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

  const { mutate: createEntry } = useApiEntryCreate({
    onSettled: async () => {
      await queryClient.invalidateQueries(["API", "entriesForInventoryDetails"]);
    },
    onSuccess: (createdEntry) => {
      queryClient.setQueryData(["API", `/entries/${createdEntry.id}`], createdEntry);
      displayNotification({
        type: "success",
        message: t("inventoryForm.entries.createSuccess"),
      });
      setEntryFormKey(new Date().getTime());
    },
    onError: () => {
      displayNotification({
        type: "error",
        message: t("inventoryForm.entries.createError"),
      });
    },
  });

  const handleSubmitInventoryForm = (inventoryFormData: UpsertInventoryInput) => {
    createInventory({ body: inventoryFormData });
  };

  const handleSubmitEntryForm = (entryFormData: UpsertEntryInput) => {
    createEntry({ body: entryFormData });
  };

  return (
    <>
      {currentStep.id === INVENTORY_STEP.id && (
        <InventoryStepContainer onSubmitInventoryForm={handleSubmitInventoryForm} />
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
