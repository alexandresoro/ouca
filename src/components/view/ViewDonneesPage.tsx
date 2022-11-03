import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Box, Container, Tab, Typography } from "@mui/material";
import React, { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
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

  const [selectedTab, setSelectedTab] = React.useState<ViewTabs>(ViewTabsValues.Donnees);

  const handleTabChange = (event: React.SyntheticEvent, newValue: ViewTabs) => {
    setSelectedTab(newValue);
  };

  return (
    <>
      <StyledPanelHeader>
        <Typography variant="h5" component="h1">
          {t("viewObservations")}
        </Typography>
      </StyledPanelHeader>

      <Container
        maxWidth="xl"
        sx={{
          marginTop: 5,
        }}
      >
        <DonneeFilter></DonneeFilter>

        <TabContext value={selectedTab}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <TabList onChange={handleTabChange}>
              <Tab label={t("view.tab.observations")} value={ViewTabsValues.Donnees} />
              <Tab label={t("view.tab.species")} value={ViewTabsValues.Especes} />
            </TabList>
          </Box>
          <TabPanel value={ViewTabsValues.Donnees}>
            <DonneeTable></DonneeTable>
          </TabPanel>
          <TabPanel value={ViewTabsValues.Especes}>
            <DonneesByEspeceTable></DonneesByEspeceTable>
          </TabPanel>
        </TabContext>
      </Container>
    </>
  );
};

export default ViewDonneesPage;
