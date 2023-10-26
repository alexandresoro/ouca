import { forwardRef, type ComponentPropsWithRef, type FunctionComponent } from "react";
import RequiredField from "./RequiredField";

type TextInputProps = {
  textInputClassName?: string;
  label?: string | JSX.Element;
  hasError?: boolean;
  helperMessage?: string;
  suffix?: string;
} & ComponentPropsWithRef<"input">;

const TextInput: FunctionComponent<TextInputProps> = forwardRef<HTMLInputElement, TextInputProps>(
  ({ textInputClassName, label, hasError, helperMessage, suffix, ...inputProps }, ref) => {
    const { className, ...restInputProps } = inputProps;

    const inputElement = (
      <input
        className={`input input-bordered ${hasError ? "input-error" : "input-primary"} ${className ?? ""} ${
          suffix && suffix.length > 0 ? "join-item" : ""
        }`}
        {...restInputProps}
        ref={ref}
      />
    );

    return (
      <div className={`form-control py-2 ${helperMessage ? "pb-0" : ""} ${textInputClassName ?? ""}`}>
        {label && (
          <label className="label py-1">
            <span className="label-text first-letter:capitalize">
              {label}
              {inputProps.required && <RequiredField />}
            </span>
          </label>
        )}

        {suffix && suffix.length > 0 && (
          <div className="join">
            {inputElement}
            <span className="join-item w-min bg-base-300/40 flex items-center px-4 border border-primary border-l-0">
              {suffix}
            </span>
          </div>
        )}

        {!suffix?.length && inputElement}

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
