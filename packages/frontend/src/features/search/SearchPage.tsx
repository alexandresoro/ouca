import { Tab } from "@headlessui/react";
import { useFeatures } from "@services/app-features/features";
import { Fragment, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import SearchEntriesTable from "./search-entries-table/SearchEntriesTable";
import SearchFilterPanel from "./search-filter-panel/SearchFilterPanel";
import SearchSpeciesTable from "./search-species-table/SearchSpeciesTable";

const SearchPage: FunctionComponent = () => {
  const { t } = useTranslation();

  const features = useFeatures();

  return (
    <div className="container mx-auto flex gap-16 mt-6">
      <div className="flex-shrink-0 w-80">
        <SearchFilterPanel />
      </div>

      <div className="flex-grow">
        <Tab.Group>
          <div className="flex justify-between mb-12">
            <Tab.List className="join">
              <Tab as={Fragment}>
                {({ selected }) => (
                  <button
                    type="button"
                    className={`join-item btn btn-primary ${selected ? "btn-active" : "btn-primary btn-outline"}`}
                  >
                    {t("view.tab.observations")}
                  </button>
                )}
              </Tab>
              <Tab as={Fragment}>
                {({ selected }) => (
                  <button
                    type="button"
                    className={`join-item btn btn-primary ${selected ? "btn-active" : "btn-primary btn-outline"}`}
                  >
                    {t("view.tab.species")}
                  </button>
                )}
              </Tab>
            </Tab.List>
            {features.tmp_export_search_results && (
              <button type="button" className="btn btn-sm btn-outline btn-secondary mt-2">
                {t("observationFilter.exportToExcel")}
              </button>
            )}
          </div>
          <Tab.Panels>
            <Tab.Panel>
              <SearchEntriesTable />
            </Tab.Panel>
            <Tab.Panel>
              <SearchSpeciesTable />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
};

export default SearchPage;
