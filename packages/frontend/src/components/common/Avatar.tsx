import { getInitials } from "@utils/name-utils";
import stringToColor from "@utils/user-profile/stringToColor";
import type { FunctionComponent } from "react";

type AvatarProps = {
  name: string | null;
};

const Avatar: FunctionComponent<AvatarProps> = ({ name }) => {
  const initials = name ? getInitials(name) : "?";

  return (
    <div className="avatar placeholder">
      <div
        style={
          name
            ? {
                backgroundColor: stringToColor(name),
              }
            : {}
        }
        className="text-white rounded-full w-8 bg-secondary"
      >
        <span>{initials}</span>
      </div>
    </div>
  );
};

export default Avatar;
