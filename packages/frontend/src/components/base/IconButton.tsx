import type { ComponentPropsWithoutRef, FunctionComponent, PropsWithChildren } from "react";

const IconButton: FunctionComponent<PropsWithChildren<ComponentPropsWithoutRef<"button">>> = ({
  children,
  className,
  ...props
}) => (
  <div className="tooltip tooltip-bottom" data-tip={!props.disabled ? props["aria-label"] : undefined}>
    <button type="button" className={`btn btn-circle btn-sm btn-ghost ${className ?? ""}`} {...props}>
      {children}
    </button>
  </div>
);

export default IconButton;
