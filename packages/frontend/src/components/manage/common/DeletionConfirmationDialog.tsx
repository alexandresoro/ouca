import { Dialog } from "@headlessui/react";
import { useRef, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";

type DeletionConfirmationDialogProps = {
  open: boolean;
  messageContent: string;
  impactedItemsMessage?: string;
  onCancelAction: () => void;
  onConfirmAction: () => void;
};

const DeletionConfirmationDialog: FunctionComponent<DeletionConfirmationDialogProps> = (props) => {
  const { open, messageContent, impactedItemsMessage, onCancelAction, onConfirmAction } = props;

  const confirmButtonRef = useRef(null);

  const { t } = useTranslation();

  return (
    <Dialog
      className={`modal ${open ? "modal-open" : ""}`}
      open={open}
      onClose={onCancelAction}
      initialFocus={confirmButtonRef}
    >
      <Dialog.Panel className="modal-box text-base-content">
        <Dialog.Title className="text-2xl font-semibold">{t("deleteConfirmationDialogTitle")}</Dialog.Title>
        <Dialog.Description as={"div"} className="flex flex-col gap-4 mt-4 mb-2">
          <div>{messageContent}</div>
          {impactedItemsMessage && <div>{impactedItemsMessage}</div>}
        </Dialog.Description>
        <div className="modal-action">
          <button className="btn btn-primary btn-outline" onClick={onCancelAction}>
            {t("deleteConfirmationDialogCancelAction")}
          </button>
          <button className="btn btn-accent btn-outline" ref={confirmButtonRef} onClick={onConfirmAction}>
            {t("deleteConfirmationDialogConfirmAction")}
          </button>
        </div>
      </Dialog.Panel>
    </Dialog>
  );
};

export default DeletionConfirmationDialog;
