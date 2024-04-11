import { atom } from "jotai";
import type { Notification } from "./Notification";

export const notificationsAtom = atom<Notification[]>([]);
