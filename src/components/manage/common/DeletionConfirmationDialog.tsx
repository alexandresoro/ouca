import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography
} from "@mui/material";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";

type DeletionConfirmationDialogProps = {
  open: boolean;
  messageContent: string;
  impactedItemsMessage?: string;
  onCancelAction: () => void;
  onConfirmAction: () => void;
};

export default function DeletionConfirmationDialog(props: DeletionConfirmationDialogProps): ReactElement {
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
        <DialogContentText id="delete-confirmation-dialog-description">
          <Typography variant="body1" component="p">
            {messageContent}
          </Typography>
          {impactedItemsMessage && (
            <Typography variant="body1" component="p">
              {impactedItemsMessage}
            </Typography>
          )}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancelAction} variant="outlined">
          {t("deleteConfirmationDialogCancelAction")}
        </Button>
        <Button
          onClick={onConfirmAction}
          autoFocus
          variant="outlined"
          sx={{
            textTransform: "uppercase"
          }}
        >
          {t("deleteConfirmationDialogConfirmAction")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
