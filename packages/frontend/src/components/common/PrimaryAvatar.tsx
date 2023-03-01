import { type FunctionComponent, type PropsWithChildren } from "react";

const PrimaryAvatar: FunctionComponent<PropsWithChildren> = ({ children }) => {
  return (
    <div className="avatar placeholder">
      <div className="rounded-full text-base-100 bg-primary dark:bg-neutral-100 h-10 w-10">{children}</div>
    </div>
  );
};

export default PrimaryAvatar;
