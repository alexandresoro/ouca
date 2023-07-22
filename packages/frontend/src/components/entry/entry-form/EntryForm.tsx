import { Tab } from "@headlessui/react";
import { getEntryResponse } from "@ou-ca/common/api/entry";
import { getInventoryResponse } from "@ou-ca/common/api/inventory";
import { useAtomValue, useSetAtom } from "jotai";
import { RESET } from "jotai/utils";
import { Fragment, Suspense, lazy, useEffect, useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import {
  inventoryAltitudeAtom,
  inventoryLatitudeAtom,
  inventoryLocalityAtom,
  inventoryLongitudeAtom,
  inventorySetAtom,
  storedCustomizedCoordinatesAtom,
} from "../../../atoms/inventoryFormAtoms";
import useApiQuery from "../../../hooks/api/useApiQuery";
import InventoryForm from "../../inventory/inventory-form/InventoryForm";
import EntryDetailsForm from "../entry-details/EntryDetailsForm";

const EntryMap = lazy(() => import("../entry-map/EntryMap"));

type EntryFormProps =
  | {
      // New entry (w/ possible existing inventory id as template)
      isNewEntry: true;
      existingInventoryId?: string;
      existingEntryId?: never;
    }
  | {
      // Existing entry
      isNewEntry?: never;
      existingInventoryId: string;
      existingEntryId: string;
    };

const EntryForm: FunctionComponent<EntryFormProps> = ({ isNewEntry, existingInventoryId, existingEntryId }) => {
  const { t } = useTranslation();

  const inventoryLocality = useAtomValue(inventoryLocalityAtom);
  const inventoryLatitude = useAtomValue(inventoryLatitudeAtom);
  const inventoryLongitude = useAtomValue(inventoryLongitudeAtom);
  const inventoryAltitude = useAtomValue(inventoryAltitudeAtom);
  const storedCustomizedCoordinates = useAtomValue(storedCustomizedCoordinatesAtom);
  const setInventory = useSetAtom(inventorySetAtom);

  const {
    data: existingInventory,
    isFetching,
    refetch,
  } = useApiQuery(
    {
      path: `/inventories/${existingInventoryId!}`,
      schema: getInventoryResponse,
    },
    {
      enabled: false,
    }
  );
  useEffect(() => {
    if (existingInventoryId) {
      void refetch();
    }
  }, [existingInventoryId, refetch]);

  const {
    data: existingEntry,
    isFetching: isFetchingEntry,
    refetch: refetchEntry,
  } = useApiQuery(
    {
      path: `/entries/${existingEntryId!}`,
      schema: getEntryResponse,
    },
    {
      enabled: false,
    }
  );
  useEffect(() => {
    if (existingEntryId) {
      void refetchEntry();
    }
  }, [existingEntryId, refetchEntry]);

  const [isInventoryReady, setIsInventoryReady] = useState(false);

  useEffect(() => {
    setIsInventoryReady(false);
    void setInventory(existingInventoryId != null ? existingInventory ?? RESET : RESET).then(() => {
      setIsInventoryReady(true);
    });
  }, [existingInventory, existingInventoryId, setInventory]);

  const entryFormKey = isNewEntry ? `new-${existingInventoryId ?? ""}` : `existing-${existingEntryId}`;

  return (
    <>
      Coords - LAT {inventoryLatitude} - LONG {inventoryLongitude} - ALT {inventoryAltitude}
      <br />
      Stored custom coords - LAT {storedCustomizedCoordinates?.lat} - LONG {storedCustomizedCoordinates?.lng} - ALT{" "}
      {storedCustomizedCoordinates?.altitude}
      <br />
      LOCALITY {JSON.stringify(inventoryLocality)}
      <div className="container mx-auto flex gap-10">
        <div className="basis-1/3 mt-4">
          {isInventoryReady && (
            <>
              {existingInventoryId != null && existingInventory != null && !isFetching && (
                <InventoryForm key={entryFormKey} isNewInventory={isNewEntry} existingInventory={existingInventory} />
              )}
              {existingInventoryId === undefined && <InventoryForm key={entryFormKey} isNewInventory={isNewEntry} />}
            </>
          )}
        </div>
        <div className="basis-2/3">
          <Tab.Group>
            <Tab.List className="join mt-6 mb-2">
              <Tab as={Fragment}>
                {({ selected }) => (
                  <button
                    type="button"
                    className={`btn btn-sm btn-primary join-item ${
                      selected ? "btn-active" : "btn-primary btn-outline"
                    }`}
                  >
                    {t("speciesForm")}
                  </button>
                )}
              </Tab>
              <Tab as={Fragment}>
                {({ selected }) => (
                  <button
                    type="button"
                    className={`btn btn-sm btn-primary join-item ${
                      selected ? "btn-active" : "btn-primary btn-outline"
                    }`}
                  >
                    {t("map")}
                  </button>
                )}
              </Tab>
            </Tab.List>
            <Tab.Panels>
              <Tab.Panel unmount={false}>
                {existingEntryId != null && existingEntry != null && !isFetchingEntry && (
                  <EntryDetailsForm key={entryFormKey} existingEntry={existingEntry} />
                )}
              </Tab.Panel>
              <Tab.Panel unmount={false}>
                <Suspense fallback={<></>}>
                  <EntryMap />
                </Suspense>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>
    </>
  );
};

export default EntryForm;
