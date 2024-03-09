import type { Notification } from "@typings/Notification";
import { atom } from "jotai";

export const notificationsAtom = atom<Notification[]>([]);
