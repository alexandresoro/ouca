import { autoUpdate, offset, shift, size, useFloating } from "@floating-ui/react";
import { Menu } from "@headlessui/react";
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

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { removeUser } = useAuth();
  const user = useUser();
  const enableImport = user?.permissions.canImport ?? false;

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

  const handleLogoutAction = async () => {
    await removeUser();
  };

  return (
    <Menu as="div">
      <Menu.Button
        ref={refs.setReference}
        className="btn btn-sm btn-circle w-8 border-none avatar placeholder focus:outline-white"
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
      </Menu.Button>

      <Menu.Items
        ref={refs.setFloating}
        style={{
          position: strategy,
          top: y ?? 0,
          left: x ?? 0,
        }}
        className="flex flex-col items-start flex-nowrap p-2 outline-none shadow-md ring-2 ring-primary bg-base-100 dark:bg-base-300 rounded-lg w-max overflow-y-auto"
      >
        {getMenuOptions(enableImport).map(({ Icon, localizationKey, to }) => {
          const CurrentMenuItem = (
            <Menu.Item key={to}>
              {({ active }) => (
                <Link
                  to={to}
                  className={`flex w-full items-center gap-3 px-4 py-2 text-sm rounded-lg ${
                    active ? "bg-opacity-20 bg-base-content" : "bg-transparent"
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
          // biome-ignore lint/correctness/useJsxKeyInIterable: <explanation>
          return [CurrentMenuItem, ...Dividers];
        })}
        <hr className="w-full border-t-[1px] my-1" />
        <Menu.Item key="/logout">
          {({ active }) => (
            <button
              type="button"
              className={`flex w-full items-center gap-3 px-4 py-2 text-sm rounded-lg ${
                active ? "bg-opacity-20 bg-base-content" : "bg-transparent"
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
