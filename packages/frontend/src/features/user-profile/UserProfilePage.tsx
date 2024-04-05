import { useUser } from "@hooks/useUser";
import ContentContainerLayout from "@layouts/ContentContainerLayout";
import StyledPanelHeader from "@layouts/StyledPanelHeader";
import { generateUniqueNickname } from "@services/unique-name/unique-name";
import stringToColor from "@utils/user-profile/stringToColor";
import type { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const UserProfilePage: FunctionComponent = () => {
  const { t } = useTranslation();

  const user = useUser();

  if (!user) {
    return null;
  }

  const nickname = generateUniqueNickname(user.id);

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
                    user.fullName
                      ? {
                          backgroundColor: stringToColor(user.fullName),
                        }
                      : {}
                  }
                  className="flex items-center justify-center uppercase font-bold text-white bg-secondary rounded-full h-16 md:h-40 w-16 md:w-40"
                >
                  <span className="text-2xl md:text-6xl">{user.initials}</span>
                </div>
                <span className="text-base-content text-lg uppercase">{user.fullName}</span>
                <span className="text-base-content text-center text-xs uppercase opacity-20 hover:opacity-60">
                  ID {user.id}
                </span>
                <p className="text-base-content text-center">
                  {t("userProfile.nicknameDescription", { nickname })}
                  <div className="text-lg font-semibold">{nickname}</div>
                </p>
                {user && (
                  <Link to={user.user.iss} target="_blank" className="btn btn-primary uppercase mt-4">
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
