import { autoUpdate, offset, shift, size, useFloating } from "@floating-ui/react";
import { Menu } from "@headlessui/react";
import { Cog, Import, LogOut, User } from "@styled-icons/boxicons-regular";
import { type ParseKeys } from "i18next";
import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "react-oidc-context";
import { Link } from "react-router-dom";
import { type AppContext } from "../../contexts/AppContext";
import useAppContext from "../../hooks/useAppContext";
import stringToColor from "../../utils/stringToColor";
import { getFullName, getInitials } from "../../utils/usernameUtils";

const getMenuOptions = (features: AppContext["features"]) => [
  {
    localizationKey: "profile" as ParseKeys,
    Icon: User,
    to: "/profile",
  },
  {
    localizationKey: "settings" as ParseKeys,
    Icon: Cog,
    to: "/settings",
  },
  ...(features.tmp_import
    ? [
        {
          localizationKey: "importFromFile" as ParseKeys,
          Icon: Import,
          to: "/import",
        },
      ]
    : []),
];

const HeaderSettings: FunctionComponent = () => {
  const { t } = useTranslation();

  const { features } = useAppContext();

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { user, removeUser } = useAuth();

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

  const fullName = getFullName(user);
  const initials = getInitials(user);

  const handleLogoutAction = async () => {
    await removeUser();
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
        {getMenuOptions(features).map(({ Icon, localizationKey, to }) => {
          const CurrentMenuItem = (
            <Menu.Item key={to}>
              {({ active }) => (
                <Link
                  to={to}
                  className={`flex w-full items-center gap-3 px-4 py-2 text-sm rounded-lg bg-transparent ${
                    active ? "bg-opacity-10 bg-base-content" : ""
                  }`}
                >
                  <>
                    <Icon className="h-5" />
                    {t(localizationKey)}
                  </>
                </Link>
              )}
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
          {({ active }) => (
            <button
              type="button"
              className={`flex w-full items-center gap-3 px-4 py-2 text-sm rounded-lg bg-transparent ${
                active ? "bg-opacity-10 bg-base-content" : ""
              }`}
              onClick={handleLogoutAction}
            >
              <LogOut className="h-5" />
              {t("logout")}
            </button>
          )}
        </Menu.Item>
      </Menu.Items>
    </Menu>
  );
};

export default HeaderSettings;
