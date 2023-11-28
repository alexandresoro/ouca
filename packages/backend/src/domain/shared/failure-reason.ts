export type AccessFailureReason = "notAllowed";

export type EntityFailureReason = "alreadyExists";

export type CommonFailureReason = AccessFailureReason | EntityFailureReason;
