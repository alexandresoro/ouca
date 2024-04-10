import Switch from "@components/base/Switch";
import { useUser } from "@hooks/useUser";
import { useAtom } from "jotai";
import type { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { searchEntriesFromAllUsersAtom } from "../searchEntriesCriteriaAtom";
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

  const user = useUser();
  const canViewAllEntries = user?.permissions.canViewAllEntries;

  const [fromAllUsers, setFromAllUsers] = useAtom(searchEntriesFromAllUsersAtom);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">{t("observationFilter.search")}</h2>
      {canViewAllEntries && (
        <Switch
          label={t("observationFilter.displayOnlyMyObservations")}
          checked={!fromAllUsers}
          onChange={(val) => setFromAllUsers(!val)}
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
