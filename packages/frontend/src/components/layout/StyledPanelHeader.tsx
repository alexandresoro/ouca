import { type ComponentPropsWithoutRef, type FunctionComponent, type PropsWithChildren } from "react";

const StyledPanelHeader: FunctionComponent<PropsWithChildren<ComponentPropsWithoutRef<"div">>> = ({
  children,
  className,
  ...restProps
}) => {
  return (
    <div
      className={`box-border h-14 md:h-16 w-full flex items-center px-12  dark:shadow-neutral/50 bg-base-200 dark:bg-neutral dark:text-neutral-content border-b-[1px] border-base-300 ${
        className ?? ""
      }`}
      {...restProps}
    >
      {children}
    </div>
  );
};

export default StyledPanelHeader;
