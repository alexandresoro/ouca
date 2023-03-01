import { forwardRef, type ComponentPropsWithoutRef, type FunctionComponent } from "react";

type SwitchProps = {
  switchClassName?: string;
  label: string;
} & ComponentPropsWithoutRef<"input">;

const Switch: FunctionComponent<SwitchProps> = forwardRef<HTMLInputElement, SwitchProps>(
  ({ switchClassName, label, ...inputProps }, ref) => {
    return (
      <div className={`form-control ${switchClassName ?? ""}`}>
        <label className="label cursor-pointer gap-4">
          <span className="label-text">{label}</span>
          <input type="checkbox" className="toggle toggle-primary" {...inputProps} ref={ref} />
        </label>
      </div>
    );
  }
);
export default Switch;
