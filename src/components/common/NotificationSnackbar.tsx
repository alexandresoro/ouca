import { Alert, AlertColor, Snackbar, SnackbarCloseReason } from "@mui/material";
import { FunctionComponent, useEffect, useState } from "react";

type NotificationSnackbarProps = {
  type?: AlertColor;
  message?: string;
  keyAlert?: number;
};

const NotificationSnackbar: FunctionComponent<NotificationSnackbarProps> = (props) => {
  const { type, message, keyAlert } = props;

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (keyAlert) {
      setIsOpen(true);
    }
  }, [keyAlert]);

  const handleNotificationClose = (event?: React.SyntheticEvent | Event, reason?: SnackbarCloseReason) => {
    if (reason === "timeout") {
      setIsOpen(false);
    }
  };

  return (
    <Snackbar
      key={keyAlert}
      open={isOpen}
      autoHideDuration={2500}
      onClose={handleNotificationClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert severity={type}>{message}</Alert>
    </Snackbar>
  );
};

NotificationSnackbar.defaultProps = {
  type: "success",
  message: ""
};

export default NotificationSnackbar;
