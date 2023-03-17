import { autoUpdate, offset, shift, size, useFloating } from "@floating-ui/react";
import { Menu } from "@headlessui/react";
import { Cog, Import, LogOut, User } from "@styled-icons/boxicons-regular";
import { type TFuncKey } from "i18next";
import { useContext, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "urql";
import { UserContext } from "../../contexts/UserContext";
import { graphql } from "../../gql";
import stringToColor from "../../utils/stringToColor";
import { getFullName, getInitials } from "../../utils/usernameUtils";

const USER_LOGOUT_MUTATION = graphql(`
  mutation Logout {
    userLogout
  }
`);

const OPTIONS_MENU_OPTIONS = [
  {
    localizationKey: "profile" as TFuncKey,
    Icon: User,
    to: "/profile",
  },
  {
    localizationKey: "settings" as TFuncKey,
    Icon: Cog,
    to: "/settings",
  },
  {
    localizationKey: "importFromFile" as TFuncKey,
    Icon: Import,
    to: "/import",
  },
];

const HeaderSettings: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { userInfo, setUserInfo } = useContext(UserContext);

  const [_, sendUserLogout] = useMutation(USER_LOGOUT_MUTATION);

  const { x, y, strategy, refs } = useFloating<HTMLButtonElement>({
    placement: "bottom-end",
    middleware: [
      offset(8),
      shift(),
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

  const fullName = getFullName(userInfo);
  const initials = getInitials(userInfo);

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
    <Menu as="div">
      <Menu.Button
        ref={refs.setReference}
        className="btn btn-circle w-8 h-8 min-h-8 border-none avatar placeholder focus:outline-white"
        aria-label={t("aria-userMenuButton")}
      >
        <div
          style={
            fullName
              ? {
                  backgroundColor: stringToColor(fullName),
                }
              : {}
          }
          className="text-white rounded-full w-8 bg-secondary"
        >
          <span>{initials}</span>
        </div>
      </Menu.Button>

      <Menu.Items
        ref={refs.setFloating}
        style={{
          position: strategy,
          top: y ?? 0,
          left: x ?? 0,
        }}
        className="flex flex-col items-start flex-nowrap p-2 outline-none shadow-md ring-2 ring-primary-focus bg-base-100 dark:bg-base-300 rounded-lg w-max overflow-y-auto"
      >
        {OPTIONS_MENU_OPTIONS.map(({ Icon, localizationKey, to }) => {
          const CurrentMenuItem = (
            <Menu.Item key={to}>
              <Link
                to={to}
                className="flex w-full items-center gap-3 px-4 py-2 text-sm rounded-lg bg-transparent ui-active:bg-opacity-10 ui-active:bg-base-content"
              >
                <>
                  <Icon className="h-5" />
                  {t(localizationKey)}
                </>
              </Link>
            </Menu.Item>
          );

          const Dividers = [];
          if (localizationKey === "settings") {
            Dividers.push(<hr key={`divider-${to}`} />);
          }
          return [CurrentMenuItem, ...Dividers];
        })}
        <hr className="w-full border-t-[1px]" />
        <Menu.Item key="/logout">
          <button
            className="flex w-full items-center gap-3 px-4 py-2 text-sm rounded-lg bg-transparent ui-active:bg-opacity-10 ui-active:bg-base-content"
            onClick={handleLogoutAction}
          >
            <LogOut className="h-5" />
            {t("logout")}
          </button>
        </Menu.Item>
      </Menu.Items>
    </Menu>
  );
};

export default HeaderSettings;
