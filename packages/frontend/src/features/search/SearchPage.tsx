import { Tab } from "@headlessui/react";
import { useApiEntryQueryAll } from "@services/api/entry/api-entry-queries";
import { useApiDownloadExport } from "@services/api/export/api-export-queries";
import { useApiSearchSpecies } from "@services/api/search/api-search-queries";
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

  const downloadExport = useApiDownloadExport({
    filename: t("exportFilename.entries"),
    path: "/generate-export/entries",
    queryParams: searchCriteria,
  });

  return (
    <div className="container mx-auto flex gap-16 mt-6">
      <div className="flex-shrink-0 w-80">
        <SearchFilterPanel />
      </div>

      <div className="flex-grow">
        <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
          <div className="flex justify-between items-center mb-12 mr-12">
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
            <div className="grow justify-end items-center ml-12 text-sm font-bold uppercase text-base-content">
              {SELECTED_TAB_MAPPING[selectedTab] === "entries" && dataEntries?.meta != null && (
                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    // TODO: Test what happens w/ big data sets before enabling this
                    disabled={dataEntries.meta.count === 0 || dataEntries.meta.count > 10000}
                    className="btn btn-sm btn-outline btn-secondary uppercase"
                    onClick={() => downloadExport()}
                  >
                    {t("observationFilter.exportToExcel")}
                    <span className="badge badge-secondary uppercase text-xs ml-auto">{t("beta")}</span>
                  </button>
                  <span>{t("search.entriesCount", { count: dataEntries.meta.count })}</span>
                </div>
              )}
              {SELECTED_TAB_MAPPING[selectedTab] === "species" && dataSpecies?.meta != null && (
                <span className="flex justify-end">{t("search.speciesCount", { count: dataSpecies.meta.count })}</span>
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
