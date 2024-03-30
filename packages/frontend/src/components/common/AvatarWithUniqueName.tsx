import { useUser } from "@hooks/useUser";
import { generateUniqueNickname } from "@services/unique-name/unique-name";
import { getInitials } from "@utils/name-utils";
import stringToColor from "@utils/user-profile/stringToColor";
import type { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";

type AvatarWithUniqueNameProps = {
  input: string | null;
};

const AvatarWithUniqueNameAvatar: FunctionComponent<AvatarWithUniqueNameProps> = ({ input }) => {
  const { t } = useTranslation();

  const user = useUser();

  if (!user) {
    return null;
  }

  const isCurrentUser = input === user.id;

  const nickname = isCurrentUser ? user.fullName : input ? generateUniqueNickname(input) : null;
  const initials = nickname ? getInitials(nickname) : "?";
  const tooltip = isCurrentUser ? t("avatar.currentUserTooltip") : nickname;

  return (
    <div className="tooltip tooltip-bottom cursor-default" data-tip={tooltip}>
      <div className="avatar placeholder w-8">
        <div
          style={{
            backgroundColor: nickname ? stringToColor(nickname) : undefined,
            opacity: 0.8,
          }}
          className={`text-white rounded-full h-8 bg-gray-600 ${
            isCurrentUser ? "ring-accent ring-1 ring-offset-base-100 ring-offset-2" : ""
          }`}
        >
          <span>{initials}</span>
        </div>
      </div>
    </div>
  );
};

export default AvatarWithUniqueNameAvatar;
