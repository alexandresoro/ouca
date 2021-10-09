export const IMPORT = "import"; // Channel that is used to handle messages related to the import functionality

export const HEARTBEAT = "heartbeat"; // Channel used for ping/pong messages

const WEBSOCKET_MESSAGE_TYPE = [IMPORT, HEARTBEAT] as const;

export type WebSocketMessageType = typeof WEBSOCKET_MESSAGE_TYPE[number];
