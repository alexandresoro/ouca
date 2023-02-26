import {
  AccountBox,
  EmojiNature,
  FileDownload,
  Filter1,
  Logout,
  Male,
  Park,
  Person,
  Pets,
  Place,
  PlusOne,
  Settings,
  SpaceBar,
  WbSunny,
} from "@mui/icons-material";
import { Divider, ListItemIcon, Menu, MenuItem } from "@mui/material";
import { ListUl, Plus, SearchAlt2 } from "@styled-icons/boxicons-regular";
import { type TFuncKey } from "i18next";
import { useContext, useState, type FunctionComponent } from "react";
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
    Icon: Person,
    to: "/manage/observateur",
  },
  {
    localizationKey: "departments" as TFuncKey,
    Icon: Place,
    to: "/manage/departement",
  },
  {
    localizationKey: "cities" as TFuncKey,
    Icon: Place,
    to: "/manage/commune",
  },
  {
    localizationKey: "localities" as TFuncKey,
    Icon: Place,
    to: "/manage/lieudit",
  },
  {
    localizationKey: "weathers" as TFuncKey,
    Icon: WbSunny,
    to: "/manage/meteo",
  },
  {
    localizationKey: "speciesClasses" as TFuncKey,
    Icon: EmojiNature,
    to: "/manage/classe",
  },
  {
    localizationKey: "species" as TFuncKey,
    Icon: EmojiNature,
    to: "/manage/espece",
  },
  {
    localizationKey: "genders" as TFuncKey,
    Icon: Male,
    to: "/manage/sexe",
  },
  {
    localizationKey: "ages" as TFuncKey,
    Icon: PlusOne,
    to: "/manage/age",
  },
  {
    localizationKey: "numberPrecisions" as TFuncKey,
    Icon: Filter1,
    to: "/manage/estimation-nombre",
  },
  {
    localizationKey: "distancePrecisions" as TFuncKey,
    Icon: SpaceBar,
    to: "/manage/estimation-distance",
  },
  {
    localizationKey: "behaviors" as TFuncKey,
    Icon: Pets,
    to: "/manage/comportement",
  },
  {
    localizationKey: "environments" as TFuncKey,
    Icon: Park,
    to: "/manage/milieu",
  },
];

const OPTIONS_MENU_OPTIONS = [
  {
    localizationKey: "profile" as TFuncKey,
    Icon: AccountBox,
    to: "/profile",
  },
  {
    localizationKey: "settings" as TFuncKey,
    Icon: Settings,
    to: "/configuration",
  },
  {
    localizationKey: "importFromFile" as TFuncKey,
    Icon: FileDownload,
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

  const [anchorElDatabase, setAnchorElDatabase] = useState<null | HTMLElement>(null);
  const openDatabaseMenu = Boolean(anchorElDatabase);

  const [anchorElOptions, setAnchorElOptions] = useState<null | HTMLElement>(null);
  const openOptionsMenu = Boolean(anchorElOptions);

  const handleClickDatabase = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElDatabase(event.currentTarget);
  };
  const handleCloseDatabaseMenu = () => {
    setAnchorElDatabase(null);
  };

  const handleClickOptions = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElOptions(event.currentTarget);
  };
  const handleCloseOptionsMenu = () => {
    setAnchorElOptions(null);
  };

  const handleLogoutAction = async () => {
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
    <div className="navbar sticky bg-primary dark:bg-neutral-800 min-h-12 px-6 py-0 place-content-between shadow-md shadow-gray-700/75">
      <Link className="gap-2.5" to="/">
        <img className="-mb-3" src={Logo} height="60px" width="70px"></img>
        <h1 className="text-neutral-50 font-['Yuji_Hentaigana_Akebono'] font-bold drop-shadow-[2px_2px_rgba(0,0,0,0.4)]">
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
        <button
          className="btn btn-sm btn-ghost flex gap-1.5 text-neutral-100 font-normal normal-case"
          onClick={handleClickDatabase}
        >
          <ListUl className="w-5 h-5" />
          {t("databaseManagementButton")}
        </button>

        <Menu
          anchorEl={anchorElDatabase}
          open={openDatabaseMenu}
          onClose={handleCloseDatabaseMenu}
          onClick={handleCloseDatabaseMenu}
        >
          {DATABASE_MENU_OPTIONS.map(({ Icon, localizationKey, to }) => {
            const CurrentMenuItem = (
              <MenuItem key={to} component={Link} to={to}>
                <ListItemIcon>
                  <Icon fontSize="small" />
                </ListItemIcon>
                {t(localizationKey) as string}
              </MenuItem>
            );

            const Dividers = [];
            if (localizationKey === "weathers") {
              Dividers.push(<Divider />);
            }
            return [CurrentMenuItem, ...Dividers];
          })}
        </Menu>

        <button
          className="btn btn-circle w-8 h-8 min-h-8 border-none avatar placeholder"
          onClick={handleClickOptions}
          aria-label={t("aria-userMenuButton")}
        >
          <div className={`text-white rounded-full w-8 ${fullName ? "bg-secondary" : ""}`}>
            <span>{initials}</span>
          </div>
        </button>

        <Menu
          anchorEl={anchorElOptions}
          open={openOptionsMenu}
          onClose={handleCloseOptionsMenu}
          onClick={handleCloseOptionsMenu}
        >
          {OPTIONS_MENU_OPTIONS.map(({ Icon, localizationKey, to }) => {
            const CurrentMenuItem = (
              <MenuItem key={to} component={Link} to={to}>
                <ListItemIcon>
                  <Icon fontSize="small" />
                </ListItemIcon>
                {t(localizationKey) as string}
              </MenuItem>
            );

            const Dividers = [];
            if (localizationKey === "settings") {
              Dividers.push(<Divider />);
            }
            return [CurrentMenuItem, ...Dividers];
          })}
          <Divider />
          <MenuItem onClick={handleLogoutAction}>
            <ListItemIcon>
              <Logout fontSize="small" />
            </ListItemIcon>
            {t("logout")}
          </MenuItem>
        </Menu>
      </div>
    </div>
  );
};

export default Header;
