export const UPDATE = "update";

export const OTHER = "other";

const WEBSOCKET_MESSAGE_TYPE = [UPDATE, OTHER] as const;

export type WebSocketMessageType = typeof WEBSOCKET_MESSAGE_TYPE[number];
