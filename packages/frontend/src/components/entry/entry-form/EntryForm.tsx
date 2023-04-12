import { Tab } from "@headlessui/react";
import { Fragment, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import TempPage from "../../TempPage";
import DataMap from "../data-map/DataMap";
import InventoryForm from "../inventory/InventoryForm";

type EntryFormProps =
  | {
      isNewEntry?: boolean;
      existingEntryId?: never;
    }
  | {
      isNewEntry?: never;
      existingEntryId: number;
    };

const EntryForm: FunctionComponent<EntryFormProps> = ({ isNewEntry, existingEntryId }) => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto flex gap-10">
      <div className="basis-1/3 mt-4">
        {isNewEntry && <InventoryForm isNewInventory={isNewEntry} />}
        {existingEntryId && <InventoryForm existingEntryId={existingEntryId} />}
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
              <DataMap />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
};

export default EntryForm;
