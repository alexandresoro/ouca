import { Dialog } from "@headlessui/react";
import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import EntryForm from "../entry-form/EntryForm";

type NewEntryDialogContainerProps = {
  inventoryId: string;
  open: boolean;
  onClose: (value: boolean) => void;
};

const NewEntryDialogContainer: FunctionComponent<NewEntryDialogContainerProps> = ({ inventoryId, open, onClose }) => {
  const { t } = useTranslation();

  return (
    <Dialog className={`modal ${open ? "modal-open" : ""}`} open={open} onClose={onClose}>
      <Dialog.Panel className="modal-box max-w-7xl">
        <Dialog.Title className="text-2xl font-semibold py-4">{t("inventoryPage.entriesPanel.newEntry")}</Dialog.Title>
        <EntryForm isNewEntry={true} existingInventoryId={inventoryId} />
      </Dialog.Panel>
    </Dialog>
  );
};

export default NewEntryDialogContainer;
