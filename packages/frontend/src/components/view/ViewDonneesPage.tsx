import { Tab } from "@headlessui/react";
import { Fragment, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import useAppContext from "../../hooks/useAppContext";
import ContentContainerLayout from "../layout/ContentContainerLayout";
import StyledPanelHeader from "../layout/StyledPanelHeader";
import DonneeFilter from "./DonneeFilter";
import DonneeTable from "./DonneeTable";
import DonneesByEspeceTable from "./DonneesByEspeceTable";

const ViewDonneesPage: FunctionComponent = () => {
  const { t } = useTranslation();

  const { features } = useAppContext();

  return (
    <>
      <StyledPanelHeader>
        <h1 className="text-2xl font-normal">{t("viewObservations")}</h1>
      </StyledPanelHeader>

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
              <DonneeTable />
            </Tab.Panel>
            <Tab.Panel>
              <DonneesByEspeceTable />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </ContentContainerLayout>
    </>
  );
};

export default ViewDonneesPage;
