import { useNotifications } from "@hooks/useNotifications";
import type { UpsertEntryInput } from "@ou-ca/common/api/entry";
import { useApiEntryCreate } from "@services/api/entry/api-entry-queries";
import { useQueryClient } from "@tanstack/react-query";
import { type FunctionComponent, useState } from "react";
import { useTranslation } from "react-i18next";
import InventoryDetails from "../../../inventory/inventory-details/InventoryDetails";
import EntryForm from "../../entry-form/EntryForm";

type EntryStepContainerProps = {
  inventoryId: string;
};

const EntryStepContainer: FunctionComponent<EntryStepContainerProps> = ({ inventoryId }) => {
  const { t } = useTranslation();

  const { displayNotification } = useNotifications();

  const [entryFormKey, setEntryFormKey] = useState(0);

  const queryClient = useQueryClient();

  const createEntry = useApiEntryCreate();

  const handleSubmitEntryForm = (entryFormData: UpsertEntryInput) => {
    createEntry({ body: entryFormData })
      .then(() => {
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

  const newEntryKey = `new-entry-inventory-${inventoryId}-${entryFormKey}`;

  return (
    <div className="container mx-auto flex gap-10 pt-4">
      <div className="basis-1/3">
        <InventoryDetails inventoryId={inventoryId} />
      </div>
      <div className="basis-2/3">
        <h2 className="text-xl font-semibold mb-3">{t("entryDetailsForm.title")}</h2>
        <EntryForm
          key={newEntryKey}
          mode="create"
          initialData={{ inventoryId }}
          onSubmitForm={handleSubmitEntryForm}
          submitFormText={t("entryForm.formCreate")}
        />
      </div>
    </div>
  );
};

export default EntryStepContainer;
