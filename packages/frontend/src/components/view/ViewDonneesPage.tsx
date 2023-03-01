import { useState, type FunctionComponent, type ReactElement } from "react";
import { useTranslation } from "react-i18next";
import ContentContainerLayout from "../layout/ContentContainerLayout";
import StyledPanelHeader from "../layout/StyledPanelHeader";
import DonneeFilter from "./DonneeFilter";
import DonneesByEspeceTable from "./DonneesByEspeceTable";
import DonneeTable from "./DonneeTable";

const ViewTabsValues = {
  Donnees: "donnees",
  Especes: "especes",
} as const;

type ViewTabsKeys = keyof typeof ViewTabsValues;

type ViewTabs = typeof ViewTabsValues[ViewTabsKeys];

const ViewDonneesPage: FunctionComponent = () => {
  const { t } = useTranslation();

  const [selectedTab, setSelectedTab] = useState<ViewTabs>(ViewTabsValues.Donnees);

  const handleTabChange = (newValue: string) => {
    setSelectedTab(newValue as ViewTabs);
  };

  const getTabToDisplay = (selectedTab: ViewTabs): ReactElement => {
    switch (selectedTab) {
      case "donnees":
        return <DonneeTable />;
      case "especes":
        return <DonneesByEspeceTable />;
    }
  };

  return (
    <>
      <StyledPanelHeader>
        <h1 className="text-2xl font-normal">{t("viewObservations")}</h1>
      </StyledPanelHeader>

      <ContentContainerLayout>
        <DonneeFilter></DonneeFilter>

        <div className="btn-group mt-6 mb-2">
          <button
            className={`btn ${selectedTab === ViewTabsValues.Donnees ? "btn-active" : "btn-primary btn-outline"}`}
            value={ViewTabsValues.Donnees}
            onClick={(e) => handleTabChange(e.currentTarget.value)}
          >
            {t("view.tab.observations")}
          </button>
          <button
            className={`btn ${selectedTab === ViewTabsValues.Especes ? "btn-active" : "btn-primary btn-outline"}`}
            value={ViewTabsValues.Especes}
            onClick={(e) => handleTabChange(e.currentTarget.value)}
          >
            {t("view.tab.species")}
          </button>
        </div>
        {getTabToDisplay(selectedTab)}
      </ContentContainerLayout>
    </>
  );
};

export default ViewDonneesPage;
