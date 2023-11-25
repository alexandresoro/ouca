import {
  type Observer,
  type ObserverCreateInput,
  type ObserverFindManyInput,
  type ObserverSimple,
} from "@domain/observer/observer.js";

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
  createObserver: (observerInput: ObserverCreateInput) => Promise<Observer>;
  createObservers: (observerInputs: ObserverCreateInput[]) => Promise<ObserverSimple[]>;
  updateObserver: (observerId: number, observerInput: ObserverCreateInput) => Promise<Observer>;
  deleteObserverById: (observerId: number) => Promise<ObserverSimple | null>;
};
