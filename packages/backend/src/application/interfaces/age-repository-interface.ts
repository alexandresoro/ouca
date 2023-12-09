import { type Age, type AgeCreateInput, type AgeFindManyInput } from "@domain/age/age.js";
import { type EntityFailureReason } from "@domain/shared/failure-reason.js";
import { type Result } from "neverthrow";

export type AgeRepository = {
  findAgeById: (id: number) => Promise<Age | null>;
  findAgeByDonneeId: (donneeId: number | undefined) => Promise<Age | null>;
  findAges: ({ orderBy, sortOrder, q, offset, limit }: AgeFindManyInput) => Promise<readonly Age[]>;
  getCount: (q?: string | null) => Promise<number>;
  createAge: (ageInput: AgeCreateInput) => Promise<Result<Age, EntityFailureReason>>;
  createAges: (ageInputs: AgeCreateInput[]) => Promise<Age[]>;
  updateAge: (ageId: number, ageInput: AgeCreateInput) => Promise<Result<Age, EntityFailureReason>>;
  deleteAgeById: (ageId: number) => Promise<Age | null>;
};
