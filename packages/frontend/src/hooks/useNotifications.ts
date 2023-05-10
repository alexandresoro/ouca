import { useCallback, useState } from "react";
import { type Notification } from "../types/Notification";

const NOTIFICATION_TIMEOUT_MS = 2500;

export const useNotifications = (): [Notification[], (notification: Omit<Notification, "id">) => number] => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((newNotification: Notification) => {
    // Limit to 5 notifications max to avoid clutter
    setNotifications((currentNotifications) => {
      const allNotifications = [...currentNotifications, newNotification];
      return allNotifications.slice(Math.max(allNotifications.length - 5, 0));
    });

    setTimeout(() => {
      // Remove the notification after a while
      setNotifications((currentNotifications) => {
        const allNotifications = currentNotifications.filter((notification) => {
          return notification.id !== newNotification.id;
        });
        return allNotifications.slice(Math.max(allNotifications.length - 5, 0));
      });
    }, NOTIFICATION_TIMEOUT_MS);
  }, []);

  const displayNotification = useCallback(
    (content: Omit<Notification, "id">): number => {
      const notificationId = new Date().getTime();
      const newNotification = {
        id: notificationId,
        ...content,
      } satisfies Notification;

      addNotification(newNotification);

      return notificationId;
    },
    [addNotification]
  );

  return [notifications, displayNotification];
};
