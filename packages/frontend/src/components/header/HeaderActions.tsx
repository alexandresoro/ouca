import { autoUpdate, offset, shift, size, useFloating } from "@floating-ui/react";
import { Menu } from "@headlessui/react";
import {
  Angry,
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
import { type TFuncKey } from "i18next";
import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useIsSizeLarge } from "../../hooks/useMediaQuery";

const OBSERVATIONS_OPTIONS = [
  {
    localizationKey: "observationButton" as TFuncKey,
    Icon: Plus,
    to: "/create/new",
  },
  {
    localizationKey: "viewObservations" as TFuncKey,
    Icon: SearchAlt2,
    to: "/view",
  },
];

const MANAGEMENT_MENU_OPTIONS = [
  {
    localizationKey: "observers" as TFuncKey,
    Icon: Group,
    to: "/manage/observateur",
  },
  {
    localizationKey: "departments" as TFuncKey,
    Icon: MapPin,
    to: "/manage/departement",
  },
  {
    localizationKey: "cities" as TFuncKey,
    Icon: MapPin,
    to: "/manage/commune",
  },
  {
    localizationKey: "localities" as TFuncKey,
    Icon: MapPin,
    to: "/manage/lieudit",
  },
  {
    localizationKey: "weathers" as TFuncKey,
    Icon: Sun,
    to: "/manage/meteo",
  },
  {
    localizationKey: "speciesClasses" as TFuncKey,
    Icon: Bug,
    to: "/manage/classe",
  },
  {
    localizationKey: "species" as TFuncKey,
    Icon: Bug,
    to: "/manage/espece",
  },
  {
    localizationKey: "genders" as TFuncKey,
    Icon: MaleSign,
    to: "/manage/sexe",
  },
  {
    localizationKey: "ages" as TFuncKey,
    Icon: CalendarPlus,
    to: "/manage/age",
  },
  {
    localizationKey: "numberPrecisions" as TFuncKey,
    Icon: PieChartAlt2,
    to: "/manage/estimation-nombre",
  },
  {
    localizationKey: "distancePrecisions" as TFuncKey,
    Icon: SpaceBar,
    to: "/manage/estimation-distance",
  },
  {
    localizationKey: "behaviors" as TFuncKey,
    Icon: Angry,
    to: "/manage/comportement",
  },
  {
    localizationKey: "environments" as TFuncKey,
    Icon: Tree,
    to: "/manage/milieu",
  },
];

const HeaderActions: FunctionComponent = () => {
  const { t } = useTranslation();

  const isSizeLarge = useIsSizeLarge();

  const floatingManage = useFloating<HTMLButtonElement>({
    middleware: [
      offset(8),
      shift({
        padding: 8,
      }),
      size({
        apply({ elements, availableHeight }) {
          Object.assign(elements.floating.style, {
            maxHeight: `${availableHeight}px`,
          });
        },
        padding: 8,
      }),
    ],
    whileElementsMounted: autoUpdate,
  });

  const entries = [...(isSizeLarge ? [] : OBSERVATIONS_OPTIONS), ...MANAGEMENT_MENU_OPTIONS];

  return (
    <div className="flex items-center gap-4">
      <Link
        className="hidden lg:flex btn btn-sm btn-ghost gap-1.5 text-neutral-100 font-normal normal-case"
        to="/create/new"
      >
        <Plus className="w-5 h-5" />
        {t("observationButton")}
      </Link>
      <Link className="hidden lg:flex btn btn-sm btn-ghost gap-1.5 text-neutral-100 font-normal normal-case" to="/view">
        <SearchAlt2 className="w-5 h-5" />
        {t("viewObservations")}
      </Link>

      <Menu>
        <Menu.Button
          ref={floatingManage.refs.setReference}
          className="btn btn-sm btn-ghost text-neutral-100 font-normal normal-case"
        >
          <ListUl className="h-5 mr-1.5" />
          <span className="hidden lg:inline">{t("databaseManagementButton")}</span>
          <ChevronDown className="h-6 ui-open:rotate-180" />
        </Menu.Button>

        <Menu.Items
          ref={floatingManage.refs.setFloating}
          style={{
            position: floatingManage.strategy,
            top: floatingManage.y ?? 0,
            left: floatingManage.x ?? 0,
          }}
          className="flex flex-col flex-nowrap p-2 outline-none shadow-md ring-2 ring-primary-focus bg-base-100 dark:bg-base-300 rounded-lg w-max overflow-y-auto"
        >
          {entries.map(({ Icon, localizationKey, to }) => {
            const CurrentMenuItem = (
              <Menu.Item key={to}>
                <Link
                  className="flex items-center gap-3 px-4 py-2 text-sm rounded-lg bg-transparent ui-active:bg-opacity-10 ui-active:bg-base-content"
                  to={to}
                >
                  <>
                    <Icon className="h-5" />
                    {t(localizationKey)}
                  </>
                </Link>
              </Menu.Item>
            );

            const Dividers = [];
            if (["observationButton", "viewObservations", "weathers"].includes(localizationKey)) {
              Dividers.push(<hr key={`divider-${to}`} className="w-full border-t-[1px] flex" />);
            }
            return [CurrentMenuItem, ...Dividers];
          })}
        </Menu.Items>
      </Menu>
    </div>
  );
};

export default HeaderActions;
