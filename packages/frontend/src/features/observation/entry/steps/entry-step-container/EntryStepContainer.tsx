import { type UpsertEntryInput } from "@ou-ca/common/api/entry";
import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import InventoryDetails from "../../../inventory/inventory-details/InventoryDetails";
import EntryForm from "../../entry-form/EntryForm";

type EntryStepContainerProps = {
  inventoryId: string;
  entryFormKey: string | number;
  onSubmitEntryForm?: (entryFormData: UpsertEntryInput) => void;
};

const EntryStepContainer: FunctionComponent<EntryStepContainerProps> = ({
  inventoryId,
  entryFormKey,
  onSubmitEntryForm,
}) => {
  const { t } = useTranslation();

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
          onSubmitForm={onSubmitEntryForm}
          submitFormText={t("entryForm.formCreate")}
        />
      </div>
    </div>
  );
};

export default EntryStepContainer;
