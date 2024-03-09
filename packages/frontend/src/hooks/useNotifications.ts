import { type Notification } from "@typings/Notification";
import { useSetAtom } from "jotai";
import { useCallback } from "react";
import { notificationsAtom } from "../features/notifications/notificationAtoms";

const NOTIFICATION_TIMEOUT_MS = 2500;

export const useDisplayNotification = (): ((notification: Omit<Notification, "id">) => number) => {
  const setNotifications = useSetAtom(notificationsAtom);

  const addNotification = useCallback(
    (newNotification: Notification) => {
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
    },
    [setNotifications],
  );

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
    [addNotification],
  );

  return displayNotification;
};
