import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { type FunctionComponent } from "react";
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

  const { t } = useTranslation();

  return (
    <Dialog
      open={open}
      onClose={onCancelAction}
      aria-labelledby="delete-confirmation-dialog-title"
      aria-describedby="delete-confirmation-dialog-description"
    >
      <DialogTitle id="delete-confirmation-dialog-title">{t("deleteConfirmationDialogTitle")}</DialogTitle>
      <DialogContent>
        <DialogContentText component="div" id="delete-confirmation-dialog-description">
          <p>{messageContent}</p>
          {impactedItemsMessage && <p>{impactedItemsMessage}</p>}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancelAction} variant="outlined">
          {t("deleteConfirmationDialogCancelAction")}
        </Button>
        <Button
          className="uppercase"
          onClick={onConfirmAction}
          autoFocus
          variant="outlined"
          sx={{
            textTransform: "uppercase",
          }}
        >
          {t("deleteConfirmationDialogConfirmAction")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeletionConfirmationDialog;
