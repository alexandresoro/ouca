import { type FunctionComponent, type ReactNode } from "react";
import PrimaryAvatar from "./PrimaryAvatar";

type ItemWithAvatarProps = {
  icon?: ReactNode;
  primary?: ReactNode;
  secondary?: ReactNode;
};

const ItemWithAvatar: FunctionComponent<ItemWithAvatarProps> = (props) => {
  const { icon, primary, secondary } = props;

  return (
    <>
      <div className="flex items-center py-2 px-4 gap-4">
        {icon ? <PrimaryAvatar>{icon}</PrimaryAvatar> : <></>}
        <div className="my-1">
          <div className="text-base">{primary}</div>
          <div className="opacity-70">{secondary}</div>
        </div>
      </div>
    </>
  );
};

export default ItemWithAvatar;
