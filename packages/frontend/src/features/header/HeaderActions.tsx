import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { useIsSizeLarge } from "@hooks/useMediaQuery";
import {
  Angry,
  BookContent,
  Bug,
  CalendarPlus,
  ChevronDown,
  Group,
  ListUl,
  MaleSign,
  MapPin,
  PieChartAlt2,
  Plus,
  SearchAlt2,
  SpaceBar,
  Sun,
} from "@styled-icons/boxicons-regular";
import { Tree } from "@styled-icons/boxicons-solid";
import type { ParseKeys } from "i18next";
import type { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

const OBSERVATIONS_OPTIONS = [
  {
    localizationKey: "appHeader.createNew" as ParseKeys,
    Icon: Plus,
    to: "/create-new",
  },
  {
    localizationKey: "appHeader.viewEntries" as ParseKeys,
    Icon: BookContent,
    to: "/last-inventory",
  },
  {
    localizationKey: "appHeader.search" as ParseKeys,
    Icon: SearchAlt2,
    to: "/search",
  },
];

const MANAGEMENT_MENU_OPTIONS = [
  {
    localizationKey: "observers" as ParseKeys,
    Icon: Group,
    to: "/manage/observateur",
  },
  {
    localizationKey: "departments" as ParseKeys,
    Icon: MapPin,
    to: "/manage/departement",
  },
  {
    localizationKey: "towns" as ParseKeys,
    Icon: MapPin,
    to: "/manage/commune",
  },
  {
    localizationKey: "localities" as ParseKeys,
    Icon: MapPin,
    to: "/manage/lieudit",
  },
  {
    localizationKey: "weathers" as ParseKeys,
    Icon: Sun,
    to: "/manage/meteo",
  },
  {
    localizationKey: "speciesClasses" as ParseKeys,
    Icon: Bug,
    to: "/manage/classe",
  },
  {
    localizationKey: "species" as ParseKeys,
    Icon: Bug,
    to: "/manage/espece",
  },
  {
    localizationKey: "genders" as ParseKeys,
    Icon: MaleSign,
    to: "/manage/sexe",
  },
  {
    localizationKey: "ages" as ParseKeys,
    Icon: CalendarPlus,
    to: "/manage/age",
  },
  {
    localizationKey: "numberPrecisions" as ParseKeys,
    Icon: PieChartAlt2,
    to: "/manage/estimation-nombre",
  },
  {
    localizationKey: "distancePrecisions" as ParseKeys,
    Icon: SpaceBar,
    to: "/manage/estimation-distance",
  },
  {
    localizationKey: "behaviors" as ParseKeys,
    Icon: Angry,
    to: "/manage/comportement",
  },
  {
    localizationKey: "environments" as ParseKeys,
    Icon: Tree,
    to: "/manage/milieu",
  },
];

const HeaderActions: FunctionComponent = () => {
  const { t } = useTranslation();

  const isSizeLarge = useIsSizeLarge();

  const entries = [...(isSizeLarge ? [] : OBSERVATIONS_OPTIONS), ...MANAGEMENT_MENU_OPTIONS];

  return (
    <div className="flex items-center gap-4">
      <Link className="hidden lg:flex btn btn-sm uppercase btn-primary" to="/create-new">
        <Plus className="h-6" />
        {t("appHeader.createNew")}
      </Link>
      <Link className="hidden lg:flex btn btn-sm btn-ghost gap-1.5 font-normal capitalize" to="/last-inventory">
        <BookContent className="h-5 w-5" />
        {t("appHeader.viewEntries")}
      </Link>
      <Link className="hidden lg:flex btn btn-sm btn-ghost gap-1.5 font-normal normal-case" to="/search">
        <SearchAlt2 className="w-5 h-5" />
        {t("appHeader.search")}
      </Link>

      <Menu>
        <MenuButton className="btn btn-sm btn-ghost font-normal normal-case data-[active]:btn-active">
          {({ active }) => (
            <>
              <ListUl className="h-5 mr-1.5" />
              <span className="hidden lg:inline">{t("appHeader.databaseManagement")}</span>
              <ChevronDown className={`h-6 ${active ? "rotate-180" : ""}`} />
            </>
          )}
        </MenuButton>

        <MenuItems
          anchor={{
            to: "bottom",
            padding: 8,
            gap: 8,
          }}
          className="z-10 flex flex-col flex-nowrap p-2 outline-none shadow-md ring-2 ring-primary bg-base-100 dark:bg-base-300 rounded-lg w-max overflow-y-auto"
        >
          {entries.map(({ Icon, localizationKey, to }) => {
            const CurrentMenuItem = (
              <MenuItem key={to}>
                {({ focus }) => (
                  <Link
                    className={`flex items-center gap-3 px-4 py-2 text-sm rounded-lg ${
                      focus ? "bg-opacity-20 bg-base-content" : "bg-transparent"
                    }`}
                    to={to}
                  >
                    <>
                      <Icon className="h-5" />
                      {t(localizationKey)}
                    </>
                  </Link>
                )}
              </MenuItem>
            );

            const Dividers = [];
            if (["inventories", "viewObservations", "weathers"].includes(localizationKey)) {
              Dividers.push(<hr key={`divider-${to}`} className="w-full border-t-[1px] flex" />);
            }
            return [CurrentMenuItem, ...Dividers];
          })}
        </MenuItems>
      </Menu>
    </div>
  );
};

export default HeaderActions;
