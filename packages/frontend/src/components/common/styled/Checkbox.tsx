import { forwardRef, type ComponentPropsWithoutRef, type FunctionComponent } from "react";

type CheckboxProps = {
  checkboxClassName?: string;
  label: string;
} & ComponentPropsWithoutRef<"input">;

const Checkbox: FunctionComponent<CheckboxProps> = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ checkboxClassName, label, ...inputProps }, ref) => {
    const { className, type, ...restInputProps } = inputProps;

    return (
      <div className={`form-control py-2 ${checkboxClassName ?? ""}`}>
        <label className="label gap-4 justify-start cursor-pointer">
          <span className="label-text">{label}</span>
          <input
            type="checkbox"
            className={`checkbox checkbox-primary ${className ?? ""}`}
            {...restInputProps}
            ref={ref}
          />
        </label>
      </div>
    );
  }
);

export default Checkbox;
