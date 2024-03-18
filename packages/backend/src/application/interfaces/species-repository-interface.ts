import type { EntityFailureReason } from "@domain/shared/failure-reason.js";
import type { Species, SpeciesCreateInput, SpeciesFindManyInput } from "@domain/species/species.js";
import type { Result } from "neverthrow";

export type SpeciesRepository = {
  findSpeciesById(id: number): Promise<Species | null>;
  findSpeciesByEntryId(entryId: string | undefined): Promise<Species | null>;
  findAllSpeciesWithClassLabel(): Promise<(Species & { classLabel: string })[]>;
  findSpecies(options?: SpeciesFindManyInput): Promise<Species[]>;
  getCount(options?: Pick<SpeciesFindManyInput, "q" | "searchCriteria">): Promise<number>;
  createSpecies(speciesInput: SpeciesCreateInput): Promise<Result<Species, EntityFailureReason>>;
  createSpeciesMultiple(speciesInputs: SpeciesCreateInput[]): Promise<Species[]>;
  updateSpecies(speciesId: number, speciesInput: SpeciesCreateInput): Promise<Result<Species, EntityFailureReason>>;
  deleteSpeciesById(speciesId: number): Promise<Species | null>;
};
