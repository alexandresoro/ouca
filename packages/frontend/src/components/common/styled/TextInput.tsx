import { forwardRef, type ComponentPropsWithoutRef, type FunctionComponent } from "react";

type TextInputProps = {
  textInputClassName?: string;
  label?: string;
  hasError?: boolean;
  helperMessage?: string;
} & ComponentPropsWithoutRef<"input">;

const TextInput: FunctionComponent<TextInputProps> = forwardRef<HTMLInputElement, TextInputProps>(
  ({ textInputClassName, label, hasError, helperMessage, ...inputProps }, ref) => {
    const { className, ...restInputProps } = inputProps;

    return (
      <div className={`form-control py-2 ${helperMessage ? "pb-0" : ""} ${textInputClassName ?? ""}`}>
        {label && (
          <label className="label py-1">
            <span className="label-text">{label}</span>
          </label>
        )}

        <input
          className={`input input-bordered ${hasError ? "input-error" : "input-primary"} ${className ?? ""}`}
          {...restInputProps}
          ref={ref}
        />
        {helperMessage != null && (
          <label className="label min-h-[22px] py-0">
            <span className="label-text-alt text-error">{helperMessage}</span>
          </label>
        )}
      </div>
    );
  }
);

export default TextInput;
