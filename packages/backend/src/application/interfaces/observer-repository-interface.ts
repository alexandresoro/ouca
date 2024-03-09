import type {
  Observer,
  ObserverCreateInput,
  ObserverFindManyInput,
  ObserverSimple,
} from "@domain/observer/observer.js";
import type { EntityFailureReason } from "@domain/shared/failure-reason.js";
import type { Result } from "neverthrow";

export type ObserverRepository = {
  findObserverById: (id: number) => Promise<Observer | null>;
  findObserverByInventoryId: (inventoryId: number | undefined) => Promise<ObserverSimple | null>;
  findAssociatesOfInventoryId: (inventoryId: number | undefined) => Promise<ObserverSimple[]>;
  findObservers: ({
    orderBy,
    sortOrder,
    q,
    offset,
    limit,
  }: ObserverFindManyInput) => Promise<readonly ObserverSimple[]>;
  getCount: (q?: string | null) => Promise<number>;
  createObserver: (observerInput: ObserverCreateInput) => Promise<Result<Observer, EntityFailureReason>>;
  createObservers: (observerInputs: ObserverCreateInput[]) => Promise<ObserverSimple[]>;
  updateObserver: (
    observerId: number,
    observerInput: ObserverCreateInput,
  ) => Promise<Result<Observer, EntityFailureReason>>;
  deleteObserverById: (observerId: number) => Promise<ObserverSimple | null>;
};
