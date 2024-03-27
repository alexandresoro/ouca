import Switch from "@components/base/Switch";
import { useUser } from "@hooks/useUser";
import { useFeatures } from "@services/app-features/features";
import { type FunctionComponent, useState } from "react";
import { useTranslation } from "react-i18next";
import SearchFilterAges from "./SearchFilterAges";
import SearchFilterBehaviors from "./SearchFilterBehaviors";
import SearchFilterBreeders from "./SearchFilterBreeders";
import SearchFilterClasses from "./SearchFilterClasses";
import SearchFilterComment from "./SearchFilterComment";
import SearchFilterDateRange from "./SearchFilterDateRange";
import SearchFilterDepartments from "./SearchFilterDepartments";
import SearchFilterEnvironments from "./SearchFilterEnvironments";
import SearchFilterLocalities from "./SearchFilterLocalities";
import SearchFilterObservers from "./SearchFilterObservers";
import SearchFilterSexes from "./SearchFilterSexes";
import SearchFilterSpecies from "./SearchFilterSpecies";
import SearchFilterTowns from "./SearchFilterTowns";

const SearchFilterPanel: FunctionComponent = () => {
  const { t } = useTranslation();

  const features = useFeatures();

  const { role } = useUser();

  const [displayOnlyOwnObservations, setDisplayOnlyOwnObservations] = useState(
    features.tmp_only_own_observations_filter && role === "admin",
  );

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">{t("observationFilter.search")}</h2>
      {features.tmp_only_own_observations_filter && role === "admin" && (
        <Switch
          label={t("observationFilter.displayOnlyMyObservations")}
          checked={displayOnlyOwnObservations}
          onChange={setDisplayOnlyOwnObservations}
        />
      )}
      <div className="flex flex-col gap-2.5">
        <SearchFilterObservers />
        <SearchFilterDateRange />
        <SearchFilterDepartments />
        <SearchFilterTowns />
        <SearchFilterLocalities />
        <SearchFilterClasses />
        <SearchFilterSpecies />
        <SearchFilterSexes />
        <SearchFilterAges />
        <SearchFilterBehaviors />
        <SearchFilterBreeders />
        <SearchFilterEnvironments />
        <SearchFilterComment />
      </div>
    </div>
  );
};

export default SearchFilterPanel;
