import { ApolloError, gql, useMutation } from "@apollo/client";
import {
  AccountBox,
  Add,
  EmojiEmotions,
  EmojiNature,
  FileDownload,
  Filter1,
  List,
  Logout,
  People,
  Person,
  Place,
  PlusOne,
  Save,
  Search,
  Settings,
  SpaceBar,
  Terrain,
  WbSunny
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
  useTheme
} from "@mui/material";
import { ReactElement, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { ReactComponent as Logo } from "../assets/img/logo.svg";
import { UserContext } from "../contexts/UserContext";
import stringToColor from "../utils/stringToColor";
import { getFullName, getInitials } from "../utils/usernameUtils";
import FlexSpacer from "./utils/FlexSpacer";

type UserLogoutResult = {
  userLogout: boolean;
};

const USER_LOGOUT_MUTATION = gql`
  mutation Logout {
    userLogout
  }
`;

const DATABASE_MENU_OPTIONS = [
  {
    localizationKey: "observersButton",
    Icon: Person,
    to: "/manage/observateur"
  },
  {
    localizationKey: "departmentsButton",
    Icon: Place,
    to: "/manage/departement"
  },
  {
    localizationKey: "citiesButton",
    Icon: Place,
    to: "/manage/commune"
  },
  {
    localizationKey: "areasButton",
    Icon: Place,
    to: "/manage/lieudit"
  },
  {
    localizationKey: "weathersButton",
    Icon: WbSunny,
    to: "/manage/meteo"
  },
  {
    localizationKey: "speciesClassesButton",
    Icon: EmojiNature,
    to: "/manage/classe"
  },
  {
    localizationKey: "speciesButton",
    Icon: EmojiNature,
    to: "/manage/espece"
  },
  {
    localizationKey: "sexesButton",
    Icon: People,
    to: "/manage/sexe"
  },
  {
    localizationKey: "agesButton",
    Icon: PlusOne,
    to: "/manage/age"
  },
  {
    localizationKey: "numberEstimatesButton",
    Icon: Filter1,
    to: "/manage/estimation-nombre"
  },
  {
    localizationKey: "distanceEstimatesButton",
    Icon: SpaceBar,
    to: "/manage/estimation-distance"
  },
  {
    localizationKey: "behaviorsButton",
    Icon: EmojiEmotions,
    to: "/manage/comportement"
  },
  {
    localizationKey: "environmentsButton",
    Icon: Terrain,
    to: "/manage/milieu"
  }
];

const OPTIONS_MENU_OPTIONS = [
  {
    localizationKey: "profile",
    Icon: AccountBox,
    to: "/profile"
  },
  {
    localizationKey: "settings",
    Icon: Settings,
    to: "/configuration"
  },
  {
    localizationKey: "exportDatabaseButton",
    Icon: Save,
    to: "/sauvegarde"
  },
  {
    localizationKey: "importFromFile",
    Icon: FileDownload,
    to: "/import"
  }
];

export default function Header(): ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();

  const { userInfo, setUserInfo } = useContext(UserContext);
  const fullName = getFullName(userInfo);
  const initials = getInitials(userInfo);

  const [sendUserLogout] = useMutation<UserLogoutResult>(USER_LOGOUT_MUTATION);

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
          <Logo
            height="60px"
            width="70px"
            style={{
              marginBottom: "-12px"
            }}
          />
          <Box
            sx={{
              marginLeft: "10px",
              fontFamily: "Showcard Gothic",
              fontSize: "26px",
              textShadow: "2px 2px rgba(0, 0, 0, 0.4)"
            }}
          >
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontFamily: "Yuji Hentaigana Akebono",
                fontWeight: "bold"
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
            gap: theme.spacing(3)
          }}
        >
          <Button component={Link} to="/creation" color="inherit" startIcon={<Add />}>
            {t("observationButton")}
          </Button>
          <Button component={Link} to="/vue" color="inherit" startIcon={<Search />}>
            {t("viewDataButton")}
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
            {DATABASE_MENU_OPTIONS.map(({ Icon, localizationKey, to }) => (
              <MenuItem key={to} component={Link} to={to}>
                <ListItemIcon>
                  <Icon fontSize="small" />
                </ListItemIcon>
                {t(localizationKey)}
              </MenuItem>
            ))}
          </Menu>

          <IconButton
            onClick={handleClickOptions}
            aria-label={t("aria-userMenuButton")}
            sx={{
              p: 0
            }}
          >
            <Avatar
              sx={{
                ...(fullName
                  ? {
                      bgcolor: stringToColor(fullName)
                    }
                  : {}),
                width: 32,
                height: 32
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
                  {t(localizationKey)}
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
}
