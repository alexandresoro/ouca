import { Tab } from "@headlessui/react";
import { Fragment, Suspense, lazy, useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "urql";
import { EntryCustomCoordinatesContext, type Coordinates } from "../../../contexts/EntryCustomCoordinatesContext";
import TempPage from "../../TempPage";
import InventoryForm from "../inventory/InventoryForm";
import { GET_EXISTING_INVENTAIRE } from "./EntryFormQueries";

const EntryMap = lazy(() => import("../entry-map/EntryMap"));

type EntryFormProps =
  | {
      // New entry (w/ possible existing inventory id as template)
      isNewEntry: true;
      existingInventoryId?: number;
      existingEntryId?: never;
    }
  | {
      // Existing entry
      isNewEntry?: never;
      existingInventoryId: number;
      existingEntryId: number;
    };

const EntryForm: FunctionComponent<EntryFormProps> = ({ isNewEntry, existingInventoryId, existingEntryId }) => {
  const { t } = useTranslation();

  const [entryCustomCoordinates, setEntryCustomCoordinates] = useState<Coordinates>({
    lat: 0,
    lng: 0,
  });

  const [{ data: existingInventory, fetching }] = useQuery({
    query: GET_EXISTING_INVENTAIRE,
    variables: {
      inventoryId: existingInventoryId!,
    },
    pause: existingInventoryId === undefined,
  });

  const inventoryFormKey = isNewEntry ? `new-${existingInventoryId ?? ""}` : `existing-${existingEntryId}`;

  return (
    <EntryCustomCoordinatesContext.Provider
      value={{ customCoordinates: entryCustomCoordinates, updateCustomCoordinates: setEntryCustomCoordinates }}
    >
      Coords - LAT {entryCustomCoordinates.lat} - LONG {entryCustomCoordinates.lng}
      <div className="container mx-auto flex gap-10">
        <div className="basis-1/3 mt-4">
          {existingInventoryId != null && existingInventory?.inventaire != null && !fetching && (
            <InventoryForm
              key={inventoryFormKey}
              isNewInventory={isNewEntry}
              existingInventory={existingInventory.inventaire}
            />
          )}
          {existingInventoryId === undefined && <InventoryForm key={inventoryFormKey} isNewInventory={isNewEntry} />}
        </div>
        <div className="basis-2/3">
          <Tab.Group>
            <Tab.List className="btn-group mt-6 mb-2">
              <Tab as={Fragment}>
                {({ selected }) => (
                  <button type="button" className={`btn btn-sm ${selected ? "btn-active" : "btn-primary btn-outline"}`}>
                    {t("speciesForm")}
                  </button>
                )}
              </Tab>
              <Tab as={Fragment}>
                {({ selected }) => (
                  <button type="button" className={`btn btn-sm ${selected ? "btn-active" : "btn-primary btn-outline"}`}>
                    {t("map")}
                  </button>
                )}
              </Tab>
            </Tab.List>
            <Tab.Panels>
              <Tab.Panel>
                <div className="bg-green-600">
                  <TempPage />
                </div>
              </Tab.Panel>
              <Tab.Panel>
                <Suspense fallback={<></>}>
                  <EntryMap />
                </Suspense>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>
    </EntryCustomCoordinatesContext.Provider>
  );
};

export default EntryForm;
