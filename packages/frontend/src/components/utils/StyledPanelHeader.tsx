import { type FunctionComponent, type PropsWithChildren } from "react";

const StyledPanelHeader: FunctionComponent<PropsWithChildren> = ({ children }) => {
  return (
    <div className="box-border h-16 md:h-20 w-full flex justify-between items-center px-12 shadow shadow-gray-500/75 bg-teal-700 dark:bg-neutral-900 text-white">
      {children}
    </div>
  );
};

export default StyledPanelHeader;
