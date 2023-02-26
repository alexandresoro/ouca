import {
  Angry,
  Bug,
  CalendarPlus,
  Cog,
  Group,
  Import,
  ListUl,
  LogOut,
  MaleSign,
  MapPin,
  PieChartAlt2,
  Plus,
  SearchAlt2,
  SpaceBar,
  Sun,
  User,
} from "@styled-icons/boxicons-regular";
import { Tree } from "@styled-icons/boxicons-solid";
import { type TFuncKey } from "i18next";
import { useContext, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "urql";
import Logo from "../assets/img/logo.svg";
import { UserContext } from "../contexts/UserContext";
import { graphql } from "../gql";
import { getFullName, getInitials } from "../utils/usernameUtils";

const USER_LOGOUT_MUTATION = graphql(`
  mutation Logout {
    userLogout
  }
`);

const DATABASE_MENU_OPTIONS = [
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

const OPTIONS_MENU_OPTIONS = [
  {
    localizationKey: "profile" as TFuncKey,
    Icon: User,
    to: "/profile",
  },
  {
    localizationKey: "settings" as TFuncKey,
    Icon: Cog,
    to: "/configuration",
  },
  {
    localizationKey: "importFromFile" as TFuncKey,
    Icon: Import,
    to: "/import",
  },
];

const Header: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { userInfo, setUserInfo } = useContext(UserContext);
  const fullName = getFullName(userInfo);
  const initials = getInitials(userInfo);

  const [_, sendUserLogout] = useMutation(USER_LOGOUT_MUTATION);

  const handleCloseOptionsMenu = () => {
    (document.activeElement as HTMLElement | null)?.blur();
  };

  const handleLogoutAction = async () => {
    handleCloseOptionsMenu();
    try {
      const logoutResult = await sendUserLogout({});
      if (logoutResult.data?.userLogout) {
        // Successful logout
        setUserInfo(null);

        // Navigate to login page
        navigate("/login", { replace: true });
      } else if (logoutResult.error?.graphQLErrors?.length) {
        setUserInfo(null);
        navigate("/login", { replace: true });
      }
    } catch (error) {
      setUserInfo(null);
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="navbar z-10 sticky bg-primary dark:bg-neutral-800 min-h-12 px-6 py-0 place-content-between shadow-md shadow-gray-700/75">
      <Link className="gap-2.5" to="/">
        <img className="-mb-3" src={Logo} height="60px" width="70px"></img>
        <h1 className="hidden md:block text-neutral-50 font-['Yuji_Hentaigana_Akebono'] font-bold drop-shadow-[2px_2px_rgba(0,0,0,0.4)]">
          oùça?
        </h1>
      </Link>
      <div className="flex items-center gap-4">
        <Link className="btn btn-sm btn-ghost flex gap-1.5 text-neutral-100 font-normal normal-case" to="/creation">
          <Plus className="w-5 h-5" />
          {t("observationButton")}
        </Link>
        <Link className="btn btn-sm btn-ghost flex gap-1.5 text-neutral-100 font-normal normal-case" to="/view">
          <SearchAlt2 className="w-5 h-5" />
          {t("viewObservations")}
        </Link>

        <div className="dropdown dropdown-hover dropdown-end">
          <button className="btn btn-sm btn-ghost text-neutral-100 font-normal normal-case">
            <ListUl className="h-5 mr-1.5" />
            {t("databaseManagementButton")}
          </button>

          <ul
            tabIndex={0}
            className="dropdown-content menu menu-compact flex-nowrap p-2 shadow bg-base-100 rounded-box w-max"
          >
            {DATABASE_MENU_OPTIONS.map(({ Icon, localizationKey, to }) => {
              const CurrentMenuItem = (
                <li key={to}>
                  <Link to={to} onClick={handleCloseOptionsMenu}>
                    <>
                      <Icon className="h-5" />
                      {t(localizationKey)}
                    </>
                  </Link>
                </li>
              );

              const Dividers = [];
              if (localizationKey === "weathers") {
                Dividers.push(<hr />);
              }
              return [CurrentMenuItem, ...Dividers];
            })}
          </ul>
        </div>

        <div className="dropdown dropdown-hover dropdown-end">
          <button
            className="btn btn-circle w-8 h-8 min-h-8 border-none avatar placeholder"
            aria-label={t("aria-userMenuButton")}
          >
            <div className={`text-white rounded-full w-8 ${fullName ? "bg-secondary" : ""}`}>
              <span>{initials}</span>
            </div>
          </button>

          <ul
            tabIndex={0}
            className="dropdown-content menu menu-compact flex-nowrap p-2 shadow bg-base-100 rounded-box w-max"
          >
            {OPTIONS_MENU_OPTIONS.map(({ Icon, localizationKey, to }) => {
              const CurrentMenuItem = (
                <li key={to}>
                  <Link to={to} onClick={handleCloseOptionsMenu}>
                    <>
                      <Icon className="h-5" />
                      {t(localizationKey)}
                    </>
                  </Link>
                </li>
              );

              const Dividers = [];
              if (localizationKey === "settings") {
                Dividers.push(<hr key={`divider-${to}`} />);
              }
              return [CurrentMenuItem, ...Dividers];
            })}
            <hr />
            <li key="/logout">
              <button
                className="bg-transparent hover:bg-opacity-10 hover:bg-base-content focus:bg-opacity-10 focus:bg-base-content active:bg-primary"
                onClick={handleLogoutAction}
              >
                <LogOut className="h-5" />
                {t("logout")}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Header;
