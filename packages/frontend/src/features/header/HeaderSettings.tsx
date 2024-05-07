import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { useUser } from "@hooks/useUser";
import { Cog, Import, LogOut, User } from "@styled-icons/boxicons-regular";
import stringToColor from "@utils/user-profile/stringToColor";
import type { ParseKeys } from "i18next";
import type { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "react-oidc-context";
import { Link } from "react-router-dom";

const getMenuOptions = (enableImport: boolean) => [
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
  ...(enableImport
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

  const { removeUser } = useAuth();
  const user = useUser();
  const enableImport = user?.permissions.canImport ?? false;

  const handleLogoutAction = async () => {
    await removeUser();
  };

  return (
    <Menu as="div">
      <MenuButton
        className="btn btn-sm btn-circle w-8 border-none avatar placeholder data-[active]:outline data-[active]:outline-1 data-[active]:outline-offset-2 data-[active]:outline-primary"
        aria-label={t("aria-userMenuButton")}
      >
        <div
          style={
            user?.fullName
              ? {
                  backgroundColor: stringToColor(user.fullName),
                }
              : {}
          }
          className="text-white rounded-full w-8 bg-secondary"
        >
          <span>{user?.initials}</span>
        </div>
      </MenuButton>

      <MenuItems
        anchor={{
          to: "bottom end",
          padding: 8,
          gap: 8,
        }}
        className="z-10 flex flex-col items-start flex-nowrap p-2 outline-none shadow-md ring-2 ring-primary bg-base-100 dark:bg-base-300 rounded-lg w-max overflow-y-auto"
      >
        {getMenuOptions(enableImport).map(({ Icon, localizationKey, to }) => {
          const CurrentMenuItem = (
            <MenuItem key={to}>
              {({ focus }) => (
                <Link
                  to={to}
                  className={`flex w-full items-center gap-3 px-4 py-2 text-sm rounded-lg ${
                    focus ? "bg-opacity-20 bg-base-content" : "bg-transparent"
                  }`}
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
          if (localizationKey === "settings") {
            Dividers.push(<hr key={`divider-${to}`} />);
          }
          return [CurrentMenuItem, ...Dividers];
        })}
        <hr className="w-full border-t-[1px] my-1" />
        <MenuItem key="/logout">
          {({ focus }) => (
            <button
              type="button"
              className={`flex w-full items-center gap-3 px-4 py-2 text-sm rounded-lg ${
                focus ? "bg-opacity-20 bg-base-content" : "bg-transparent"
              }`}
              onClick={handleLogoutAction}
            >
              <LogOut className="h-5" />
              {t("logout")}
            </button>
          )}
        </MenuItem>
      </MenuItems>
    </Menu>
  );
};

export default HeaderSettings;
