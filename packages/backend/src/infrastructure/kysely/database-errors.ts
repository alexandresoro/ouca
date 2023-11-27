import { type EntityFailureReason } from "@domain/shared/failure-reason.js";
import pg from "pg";

const isDatabaseError = (error: unknown): error is pg.DatabaseError => {
  return error instanceof pg.DatabaseError;
};

export const isUniqueViolationError = (error: unknown): boolean => {
  return isDatabaseError(error) && error.code === "23505";
};

export const handleDatabaseError = (error: unknown): EntityFailureReason => {
  if (isUniqueViolationError(error)) {
    return "alreadyExists";
  }

  throw error;
};
