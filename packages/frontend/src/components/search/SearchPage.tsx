import { Tab } from "@headlessui/react";
import { Fragment, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import useAppContext from "../../hooks/useAppContext";
import ContentContainerLayout from "../layout/ContentContainerLayout";
import DonneeFilter from "./DonneeFilter";
import SearchEntriesTable from "./search-entries-table/SearchEntriesTable";
import SearchSpeciesTable from "./search-species-table/SearchSpeciesTable";

const SearchPage: FunctionComponent = () => {
  const { t } = useTranslation();

  const { features } = useAppContext();

  return (
    <>
      <ContentContainerLayout>
        {features.tmp_view_search_filters && <DonneeFilter />}

        <Tab.Group>
          <Tab.List className="join mt-6 mb-2">
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
          <Tab.Panels>
            <Tab.Panel>
              <SearchEntriesTable />
            </Tab.Panel>
            <Tab.Panel>
              <SearchSpeciesTable />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </ContentContainerLayout>
    </>
  );
};

export default SearchPage;
