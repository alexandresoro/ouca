import { type ComponentPropsWithoutRef, type FunctionComponent, type PropsWithChildren } from "react";

const StyledPanelHeader: FunctionComponent<PropsWithChildren<ComponentPropsWithoutRef<"div">>> = ({
  children,
  className,
  ...restProps
}) => {
  return (
    <div
      className={`box-border h-16 md:h-20 w-full flex items-center px-12 shadow shadow-gray-500/75 dark:shadow-neutral/50 bg-primary dark:bg-neutral text-neutral-100 dark:text-neutral-content ${
        className ?? ""
      }`}
      {...restProps}
    >
      {children}
    </div>
  );
};

export default StyledPanelHeader;
