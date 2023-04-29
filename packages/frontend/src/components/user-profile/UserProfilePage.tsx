import { type User } from "oidc-client-ts";
import { type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "react-oidc-context";
import { Link } from "react-router-dom";
import stringToColor from "../../utils/stringToColor";
import { getFullName, getInitials } from "../../utils/usernameUtils";
import ContentContainerLayout from "../layout/ContentContainerLayout";
import StyledPanelHeader from "../layout/StyledPanelHeader";

const ROLES = ["admin", "contributor"] as const;

const getRole = (user: User): typeof ROLES[number] | null | undefined => {
  const rolesMap = user.profile["urn:zitadel:iam:org:project:roles"] as Record<string, unknown>[] | undefined;
  if (!rolesMap) {
    // Should not happen in practice
    return null;
  }

  const roles = Object.keys(rolesMap);

  return ROLES.find((existingRole) => roles.includes(existingRole));
};

const UserProfilePage: FunctionComponent = () => {
  const { t } = useTranslation();

  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const fullName = getFullName(user);
  const initials = getInitials(user);

  const role = getRole(user);

  return (
    <>
      <StyledPanelHeader>
        <h1 className="text-2xl font-normal">{t("profile")}</h1>
      </StyledPanelHeader>
      <ContentContainerLayout>
        <div className="hero max-w-5xl mx-auto border-2 border-primary rounded-2xl bg-base-200 dark:bg-base-300 shadow-xl">
          <div className="hero-content w-full max-w-5xl">
            <div className="card w-full">
              <div className="card-body items-center gap-4">
                <div
                  style={
                    fullName
                      ? {
                          backgroundColor: stringToColor(fullName),
                        }
                      : {}
                  }
                  className="flex items-center justify-center uppercase font-bold text-white bg-secondary rounded-full h-16 md:h-40 w-16 md:w-40"
                >
                  <span className="text-2xl md:text-6xl">{initials}</span>
                </div>
                <span className="text-base-content text-lg uppercase">{fullName}</span>
                {role && <span className="badge badge-outline badge-accent">{t(`userRoles.${role}`)}</span>}
                {user && (
                  <span className="text-base-content text-center text-xs uppercase opacity-20 hover:opacity-60">
                    ID {user.profile.sub}
                  </span>
                )}
                {user && (
                  <Link to={user.profile.iss} target="_blank" className="btn btn-primary mt-4">
                    {t("updateProfileButton")}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </ContentContainerLayout>
    </>
  );
};

export default UserProfilePage;
