export type AccessFailureReason = "unauthorized";

export type EntityFailureReason = "alreadyExists";

export type CommonFailureReason = AccessFailureReason | EntityFailureReason;
