export interface ImportResponse {
  isSuccessful: boolean;

  reasonForFailure?: string;

  numberOfLinesExtracted?: number;

  numberOfLinesFailedToImport?: number;

  errorFileName?: string;

  errors?: string[][];
}
