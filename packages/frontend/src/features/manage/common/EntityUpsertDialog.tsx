import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import type { FunctionComponent, PropsWithChildren } from "react";

type EntityUpsertDialogProps = {
  open: boolean;
  onClose: (value: boolean) => void;
  title?: string;
};

const EntityUpsertDialog: FunctionComponent<PropsWithChildren<EntityUpsertDialogProps>> = ({
  open,
  onClose,
  title,
  children,
}) => {
  return (
    <Dialog className={`modal ${open ? "modal-open" : ""}`} open={open} onClose={onClose}>
      <DialogPanel className="modal-box max-w-3xl">
        <DialogTitle className="text-2xl font-semibold py-4 first-letter:uppercase">{title}</DialogTitle>
        {children}
      </DialogPanel>
    </Dialog>
  );
};

export default EntityUpsertDialog;
