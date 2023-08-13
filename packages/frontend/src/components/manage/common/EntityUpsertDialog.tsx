import { Dialog } from "@headlessui/react";
import { type FunctionComponent, type PropsWithChildren } from "react";

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
      <Dialog.Panel className="modal-box max-w-3xl">
        <Dialog.Title className="text-2xl font-semibold py-4 first-letter:uppercase">{title}</Dialog.Title>
        {children}
      </Dialog.Panel>
    </Dialog>
  );
};

export default EntityUpsertDialog;
