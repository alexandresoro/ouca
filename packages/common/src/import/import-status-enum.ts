export enum ImportStatusEnum {
  NOT_STARTED = "notStarted",
  ONGOING = "ongoing",
  COMPLETE = "complete",
  FAILED = "failed",
}

export enum OngoingSubStatus {
  PROCESS_STARTED = "processStarted",
  RETRIEVING_REQUIRED_DATA = "retrievingRequiredData",
  VALIDATING_INPUT_FILE = "validatingInputFile",
  INSERTING_IMPORTED_DATA = "insertingImportedData",
}
