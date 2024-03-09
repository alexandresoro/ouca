import { CheckCircle, Error as ErrorIcon, InfoCircle, XCircle } from "@styled-icons/boxicons-regular";
import type { AlertType } from "@typings/Notification";
import { useAtomValue } from "jotai";
import type { FunctionComponent, ReactElement } from "react";
import { notificationsAtom } from "./notificationAtoms";

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

const NotificationSnackbar: FunctionComponent = () => {
  const notifications = useAtomValue(notificationsAtom);

  return (
    <div className="toast toast-center w-max z-50 shadow-sm">
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

export default NotificationSnackbar;
