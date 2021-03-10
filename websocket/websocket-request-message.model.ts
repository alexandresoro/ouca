export const INIT = "init";

const WEBSOCKET_REQUEST_MESSAGE_TYPE = [INIT] as const;

export type WebSocketRequestMessageType = typeof WEBSOCKET_REQUEST_MESSAGE_TYPE[number];
