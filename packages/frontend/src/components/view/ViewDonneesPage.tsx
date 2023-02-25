import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Tab } from "@mui/material";
import { useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import ContentContainerLayout from "../layout/ContentContainerLayout";
import StyledPanelHeader from "../utils/StyledPanelHeader";
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

  const handleTabChange = (event: React.SyntheticEvent, newValue: ViewTabs) => {
    setSelectedTab(newValue);
  };

  return (
    <>
      <StyledPanelHeader>
        <h1 className="text-2xl font-normal">{t("viewObservations")}</h1>
      </StyledPanelHeader>

      <ContentContainerLayout>
        <DonneeFilter></DonneeFilter>

        <TabContext value={selectedTab}>
          <TabList className="border-b border-gray-200" onChange={handleTabChange}>
            <Tab label={t("view.tab.observations")} value={ViewTabsValues.Donnees} />
            <Tab label={t("view.tab.species")} value={ViewTabsValues.Especes} />
          </TabList>
          <TabPanel value={ViewTabsValues.Donnees}>
            <DonneeTable></DonneeTable>
          </TabPanel>
          <TabPanel value={ViewTabsValues.Especes}>
            <DonneesByEspeceTable></DonneesByEspeceTable>
          </TabPanel>
        </TabContext>
      </ContentContainerLayout>
    </>
  );
};

export default ViewDonneesPage;
