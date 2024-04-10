import { Tab } from "@headlessui/react";
import { useApiEntryQueryAll } from "@services/api/entry/api-entry-queries";
import { useApiSearchSpecies } from "@services/api/search/api-search-queries";
import { useFeatures } from "@services/app-features/features";
import { useAtomValue } from "jotai";
import { Fragment, type FunctionComponent, useState } from "react";
import { useTranslation } from "react-i18next";
import SearchEntriesTable from "./search-entries-table/SearchEntriesTable";
import SearchFilterPanel from "./search-filter-panel/SearchFilterPanel";
import SearchSpeciesTable from "./search-species-table/SearchSpeciesTable";
import { searchEntriesCriteriaAtom } from "./searchEntriesCriteriaAtom";

const SELECTED_TAB_MAPPING = ["entries", "species"] as const;

const SearchPage: FunctionComponent = () => {
  const { t } = useTranslation();

  const features = useFeatures();

  const searchCriteria = useAtomValue(searchEntriesCriteriaAtom);

  const [selectedTab, setSelectedTab] = useState(0);

  const { data: dataEntries } = useApiEntryQueryAll({
    queryParams: {
      pageNumber: 1,
      pageSize: 1,
      ...searchCriteria,
    },
    paused: selectedTab !== 0,
  });

  const { data: dataSpecies } = useApiSearchSpecies({
    queryParams: {
      pageNumber: 1,
      pageSize: 1,
      ...searchCriteria,
    },
    paused: selectedTab !== 1,
  });

  return (
    <div className="container mx-auto flex gap-16 mt-6">
      <div className="flex-shrink-0 w-80">
        <SearchFilterPanel />
      </div>

      <div className="flex-grow">
        <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
          <div className="flex justify-between mb-12">
            <Tab.List className="join">
              <Tab as={Fragment}>
                {({ selected }) => (
                  <button
                    type="button"
                    className={`join-item btn btn-primary uppercase ${
                      selected ? "btn-active" : "btn-primary btn-outline"
                    }`}
                  >
                    {t("view.tab.observations")}
                  </button>
                )}
              </Tab>
              <Tab as={Fragment}>
                {({ selected }) => (
                  <button
                    type="button"
                    className={`join-item btn btn-primary uppercase ${
                      selected ? "btn-active" : "btn-primary btn-outline"
                    }`}
                  >
                    {t("view.tab.species")}
                  </button>
                )}
              </Tab>
            </Tab.List>
            <div className="flex gap-4">
              <div
                className={`flex items-center text-sm font-bold uppercase text-base-content ${
                  features.tmp_export_search_results ? "" : "mr-12"
                }`}
              >
                {SELECTED_TAB_MAPPING[selectedTab] === "entries" &&
                  dataEntries?.meta != null &&
                  t("search.entriesCount", { count: dataEntries.meta.count })}
                {SELECTED_TAB_MAPPING[selectedTab] === "species" &&
                  dataSpecies?.meta != null &&
                  t("search.speciesCount", { count: dataSpecies.meta.count })}
              </div>
              {features.tmp_export_search_results && (
                <button type="button" className="btn btn-sm btn-outline btn-secondary uppercase mt-2">
                  {t("observationFilter.exportToExcel")}
                </button>
              )}
            </div>
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
