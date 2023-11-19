import Switch from "@components/base/Switch";
import { useFeatures } from "@services/app-features/features";
import { useState, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import SearchFilterBehaviors from "./SearchFilterBehaviors";
import SearchFilterBreeders from "./SearchFilterBreeders";
import SearchFilterDateRange from "./SearchFilterDateRange";
import SearchFilterDepartments from "./SearchFilterDepartments";
import SearchFilterSpecies from "./SearchFilterSpecies";
import SearchFilterTowns from "./SearchFilterTowns";

const SearchFilterPanel: FunctionComponent = () => {
  const { t } = useTranslation();

  const features = useFeatures();

  const [displayOnlyOwnObservations, setDisplayOnlyOwnObservations] = useState(
    features.tmp_only_own_observations_filter
  );

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">{t("observationFilter.search")}</h2>
      {features.tmp_only_own_observations_filter && (
        <Switch
          label={t("observationFilter.displayOnlyMyObservations")}
          checked={displayOnlyOwnObservations}
          onChange={setDisplayOnlyOwnObservations}
        />
      )}
      <div className="flex flex-col gap-2.5">
        <SearchFilterDateRange />
        <SearchFilterDepartments />
        <SearchFilterTowns />
        <SearchFilterSpecies />
        <SearchFilterBehaviors />
        <SearchFilterBreeders />
      </div>
    </div>
  );
};

export default SearchFilterPanel;
