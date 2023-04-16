import { Tab } from "@headlessui/react";
import { Fragment, Suspense, lazy, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import TempPage from "../../TempPage";
import InventoryForm from "../inventory/InventoryForm";

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

  const inventoryFormKey = isNewEntry ? `new-${existingInventoryId ?? ""}` : `existing-${existingEntryId}`;

  return (
    <div className="container mx-auto flex gap-10">
      <div className="basis-1/3 mt-4">
        <InventoryForm key={inventoryFormKey} isNewInventory={isNewEntry} existingInventoryId={existingInventoryId} />
      </div>
      <div className="basis-2/3">
        <Tab.Group>
          <Tab.List className="btn-group mt-6 mb-2">
            <Tab as={Fragment}>
              {({ selected }) => (
                <button className={`btn btn-sm ${selected ? "btn-active" : "btn-primary btn-outline"}`}>
                  {t("speciesForm")}
                </button>
              )}
            </Tab>
            <Tab as={Fragment}>
              {({ selected }) => (
                <button className={`btn btn-sm ${selected ? "btn-active" : "btn-primary btn-outline"}`}>
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
  );
};

export default EntryForm;
