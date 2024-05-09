import { Description, Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { type FunctionComponent, useRef } from "react";
import { useTranslation } from "react-i18next";

type DeletionConfirmationDialogProps = {
  open: boolean;
  messageContent: string;
  onCancelAction: () => void;
  onConfirmAction: () => void;
};

const DeletionConfirmationDialog: FunctionComponent<DeletionConfirmationDialogProps> = (props) => {
  const { open, messageContent, onCancelAction, onConfirmAction } = props;

  const confirmButtonRef = useRef(null);

  const { t } = useTranslation();

  return (
    <Dialog
      className={`modal ${open ? "modal-open" : ""}`}
      open={open}
      onClose={onCancelAction}
      initialFocus={confirmButtonRef}
    >
      <DialogPanel className="modal-box text-base-content">
        <DialogTitle className="text-2xl font-semibold">{t("deleteConfirmationDialogTitle")}</DialogTitle>
        <Description as={"div"} className="flex flex-col gap-4 mt-4 mb-2">
          <div>{messageContent}</div>
        </Description>
        <div className="modal-action">
          <button type="button" className="btn btn-primary btn-outline uppercase" onClick={onCancelAction}>
            {t("deleteConfirmationDialogCancelAction")}
          </button>
          <button
            type="button"
            className="btn btn-error btn-outline uppercase"
            ref={confirmButtonRef}
            onClick={onConfirmAction}
          >
            {t("deleteConfirmationDialogConfirmAction")}
          </button>
        </div>
      </DialogPanel>
    </Dialog>
  );
};

export default DeletionConfirmationDialog;
