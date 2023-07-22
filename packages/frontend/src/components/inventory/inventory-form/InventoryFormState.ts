export type InventoryFormState = {
  observerId: string | null;
  associateIds: string[];
  date: string | null;
  time: string | null;
  duration: string | null;
  localityId: string | null;
  coordinates: {
    latitude: number | null;
    longitude: number | null;
    altitude: number | null;
  };
  temperature: number | null;
  weatherIds: string[];
};
