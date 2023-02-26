import { useState, type Dispatch } from "react";
import { type Notification } from "../types/Notification";

const NOTIFICATION_TIMEOUT_MS = 2500;

export const useNotifications = (): [Notification[], Dispatch<Omit<Notification, "id">>] => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const displayNotification = (content: Omit<Notification, "id">): void => {
    const notificationId = new Date().getTime();
    const newNotification: Notification = {
      id: notificationId,
      ...content,
    };
    // Limit to 5 notifications max to avoid clutter
    const allNotifications = [...notifications, newNotification];
    setNotifications(allNotifications.slice(Math.max(allNotifications.length - 5, 0)));

    setTimeout(() => {
      // Remove the notification after a while
      setNotifications((currentNotifications) => {
        const allNotifications = currentNotifications.filter((notification) => {
          return notification.id !== notificationId;
        });
        return allNotifications.slice(Math.max(allNotifications.length - 5, 0));
      });
    }, NOTIFICATION_TIMEOUT_MS);
  };

  return [notifications, displayNotification];
};
