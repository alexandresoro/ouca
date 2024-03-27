import { useUser } from "@hooks/useUser";
import ContentContainerLayout from "@layouts/ContentContainerLayout";
import StyledPanelHeader from "@layouts/StyledPanelHeader";
import stringToColor from "@utils/user-profile/stringToColor";
import type { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const UserProfilePage: FunctionComponent = () => {
  const { t } = useTranslation();

  const {
    auth: { user },
    role,
    fullName,
    initials,
  } = useUser();

  if (!user) {
    return null;
  }

  return (
    <>
      <StyledPanelHeader>
        <h1 className="text-2xl font-normal">{t("profile")}</h1>
      </StyledPanelHeader>
      <ContentContainerLayout>
        <div className="hero max-w-5xl mx-auto border-2 border-primary rounded-2xl shadow-xl">
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
                  <Link to={user.profile.iss} target="_blank" className="btn btn-primary uppercase mt-4">
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
