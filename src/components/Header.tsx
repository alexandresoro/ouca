import { ApolloError, useMutation } from "@apollo/client";
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
  Box,
  Button,
  ButtonBase,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  useTheme,
} from "@mui/material";
import { TFuncKey } from "i18next";
import { FunctionComponent, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../assets/img/logo.svg";
import { UserContext } from "../contexts/UserContext";
import { graphql } from "../gql";
import { getFullName, getInitials } from "../utils/usernameUtils";
import FlexSpacer from "./utils/FlexSpacer";

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

  const [sendUserLogout] = useMutation(USER_LOGOUT_MUTATION);

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

  const handleLogoutAction = async (event: React.MouseEvent<HTMLElement>) => {
    try {
      const logoutResult = await sendUserLogout();
      if (logoutResult?.data?.userLogout) {
        // Successful logout
        setUserInfo(null);

        // Navigate to login page
        navigate("/login", { replace: true });
      }
    } catch (error) {
      const apolloError = error as ApolloError;

      // If we have an error because the user is not considered as authenticated,
      // reset anyway
      if (apolloError?.graphQLErrors?.[0]?.extensions?.code === "UNAUTHENTICATED") {
        setUserInfo(null);
        navigate("/login", { replace: true });
      }
    }
  };

  return (
    <AppBar position="sticky">
      <Toolbar variant="dense">
        <ButtonBase component={Link} to="/">
          <img
            src={Logo}
            height="60px"
            width="70px"
            style={{
              marginBottom: "-12px",
            }}
          ></img>
          <Box
            sx={{
              marginLeft: "10px",
              fontFamily: "Showcard Gothic",
              fontSize: "26px",
              textShadow: "2px 2px rgba(0, 0, 0, 0.4)",
            }}
          >
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontFamily: "Yuji Hentaigana Akebono",
                fontWeight: "bold",
              }}
            >
              oùça?
            </Typography>
          </Box>
        </ButtonBase>
        <FlexSpacer />
        <Box
          sx={{
            display: "flex",
            gap: theme.spacing(3),
          }}
        >
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

          <IconButton
            onClick={handleClickOptions}
            aria-label={t("aria-userMenuButton")}
            sx={{
              p: 0,
            }}
          >
            <Avatar
              sx={{
                ...(fullName
                  ? {
                      bgcolor: theme.palette.secondary.main,
                    }
                  : {}),
                width: 32,
                height: 32,
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
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
