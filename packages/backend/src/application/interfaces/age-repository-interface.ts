import { type Age, type AgeCreateInput, type AgeFindManyInput } from "@domain/age/age.js";

export type AgeRepository = {
  findAgeById: (id: number) => Promise<Age | null>;
  findAgeByDonneeId: (donneeId: number | undefined) => Promise<Age | null>;
  findAges: ({ orderBy, sortOrder, q, offset, limit }: AgeFindManyInput) => Promise<readonly Age[]>;
  getCount: (q?: string | null) => Promise<number>;
  createAge: (ageInput: AgeCreateInput) => Promise<Age>;
  createAges: (ageInputs: AgeCreateInput[]) => Promise<readonly Age[]>;
  updateAge: (ageId: number, ageInput: AgeCreateInput) => Promise<Age>;
  deleteAgeById: (ageId: number) => Promise<Age>;
};
