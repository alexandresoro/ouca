import { type ImportErrorType } from "./import-error-types.js";
import { type ImportStatusEnum, type OngoingSubStatus } from "./import-status-enum.js";
import { type OngoingValidationStats } from "./ongoing-validation-stats.js";

export type ImportStatus = {
  status: ImportStatusEnum;
  subStatus?: OngoingSubStatus;
  errorType?: ImportErrorType;
  errorDescription?: string;
  importErrorsReportFile?: string;
  ongoingValidationStats?: OngoingValidationStats;
};
