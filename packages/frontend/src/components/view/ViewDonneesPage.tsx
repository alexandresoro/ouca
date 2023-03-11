import { Tab } from "@headlessui/react";
import { Fragment, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import ContentContainerLayout from "../layout/ContentContainerLayout";
import StyledPanelHeader from "../layout/StyledPanelHeader";
import DonneeFilter from "./DonneeFilter";
import DonneesByEspeceTable from "./DonneesByEspeceTable";
import DonneeTable from "./DonneeTable";

const ViewDonneesPage: FunctionComponent = () => {
  const { t } = useTranslation();

  return (
    <>
      <StyledPanelHeader>
        <h1 className="text-2xl font-normal">{t("viewObservations")}</h1>
      </StyledPanelHeader>

      <ContentContainerLayout>
        <DonneeFilter></DonneeFilter>

        <Tab.Group>
          <Tab.List className="btn-group mt-6 mb-2">
            <Tab as={Fragment}>
              {({ selected }) => (
                <button className={`btn ${selected ? "btn-active" : "btn-primary btn-outline"}`}>
                  {t("view.tab.observations")}
                </button>
              )}
            </Tab>
            <Tab as={Fragment}>
              {({ selected }) => (
                <button className={`btn ${selected ? "btn-active" : "btn-primary btn-outline"}`}>
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
