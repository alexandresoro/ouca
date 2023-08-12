import { forwardRef, type ComponentPropsWithoutRef, type FunctionComponent } from "react";
import RequiredField from "./RequiredField";

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
          <span className="label-text">
            {label}
            {inputProps.required && <RequiredField />}
          </span>
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
