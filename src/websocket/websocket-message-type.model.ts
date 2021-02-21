export const UPDATE = "update";

export const IMPORT = "import"; // Channel that is used to handle messages related to the import functionality

export const OTHER = "other";

export const TEXT = "text";

export const HEARTBEAT = "heartbeat"; // Channel used for ping/pong messages

const WEBSOCKET_MESSAGE_TYPE = [UPDATE, IMPORT, OTHER, TEXT, HEARTBEAT] as const;

export type WebSocketMessageType = typeof WEBSOCKET_MESSAGE_TYPE[number];
