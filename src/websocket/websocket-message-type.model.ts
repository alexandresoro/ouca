export const UPDATE = "update";

export const OTHER = "other";

export const TEXT = "text";

const WEBSOCKET_MESSAGE_TYPE = [UPDATE, OTHER, TEXT] as const;

export type WebSocketMessageType = typeof WEBSOCKET_MESSAGE_TYPE[number];
