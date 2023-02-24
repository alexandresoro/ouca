import {
  AccountBox,
  Add,
  EmojiNature,
  FileDownload,
  Filter1,
  List,
  Logout,
  Male,
  Park,
  Person,
  Pets,
  Place,
  PlusOne,
  Search,
  Settings,
  SpaceBar,
  WbSunny,
} from "@mui/icons-material";
import {
  AppBar,
  Avatar,
  Button,
  ButtonBase,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Toolbar,
  useTheme,
} from "@mui/material";
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
  const theme = useTheme();
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
    <AppBar position="sticky">
      <Toolbar className="place-content-between" variant="dense">
        <ButtonBase className="gap-2.5" component={Link} to="/">
          <img className="-mb-3" src={Logo} height="60px" width="70px"></img>
          <h1 className="font-['Yuji_Hentaigana_Akebono'] font-bold drop-shadow-[2px_2px_rgba(0,0,0,0.4)]">oùça?</h1>
        </ButtonBase>
        <div className="flex gap-6">
          <Button component={Link} to="/creation" color="inherit" startIcon={<Add />}>
            {t("observationButton")}
          </Button>
          <Button component={Link} to="/view" color="inherit" startIcon={<Search />}>
            {t("viewObservations")}
          </Button>
          <Button color="inherit" startIcon={<List />} onClick={handleClickDatabase}>
            {t("databaseManagementButton")}
          </Button>

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

          <IconButton className="p-0" onClick={handleClickOptions} aria-label={t("aria-userMenuButton")}>
            <Avatar
              className="w-8 h-8"
              sx={{
                ...(fullName
                  ? {
                      bgcolor: theme.palette.secondary.main,
                    }
                  : {}),
              }}
            >
              {initials}
            </Avatar>
          </IconButton>

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
      </Toolbar>
    </AppBar>
  );
};

export default Header;
