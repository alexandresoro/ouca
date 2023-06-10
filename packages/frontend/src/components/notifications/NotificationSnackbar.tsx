import { CheckCircle, Error as ErrorIcon, InfoCircle, XCircle } from "@styled-icons/boxicons-regular";
import { type FunctionComponent, type ReactElement } from "react";
import { type AlertType, type Notification } from "../../types/Notification";

type NotificationSnackbarProps = {
  notifications: Notification[];
};

const getAlertIcon = (type: AlertType): ReactElement => {
  switch (type) {
    case "info":
      return <InfoCircle className="h-6" />;
    case "success":
      return <CheckCircle className="h-6" />;
    case "error":
      return <XCircle className="h-6" />;
    case "warning":
      return <ErrorIcon className="h-6" />;
  }
};

const NotificationSnackbar: FunctionComponent<NotificationSnackbarProps> = (props) => {
  const { notifications } = props;

  return (
    <div className="toast toast-center w-max">
      {notifications.map(({ id, message, type }) => (
        <div
          key={`notification-${id}`}
          className={`alert shadow-lg ${type === "info" ? "alert-info" : ""} ${
            type === "success" ? "alert-success" : ""
          } ${type === "error" ? "alert-error" : ""} ${type === "warning" ? "alert-warning" : ""}`}
        >
          {type && getAlertIcon(type)}
          <span>{message}</span>
        </div>
      ))}
    </div>
  );
};

NotificationSnackbar.defaultProps = {
  notifications: [],
};

export default NotificationSnackbar;
