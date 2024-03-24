export type LocalityGeoJSONRepository = {
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  getLocalities(): Promise<unknown | null>;
  saveLocalities(localitiesCollection: unknown): Promise<void>;
};
