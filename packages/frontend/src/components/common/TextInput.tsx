import { forwardRef, type ComponentPropsWithoutRef, type FunctionComponent } from "react";

type TextInputProps = {
  textInputClassName?: string;
  label?: string;
  helperMessage?: string;
} & ComponentPropsWithoutRef<"input">;

const TextInput: FunctionComponent<TextInputProps> = forwardRef<HTMLInputElement, TextInputProps>(
  ({ textInputClassName, label, helperMessage, ...inputProps }, ref) => {
    return (
      <div className={`form-control ${textInputClassName ?? ""}`}>
        {label && (
          <label className="label py-1">
            <span className="label-text">{label}</span>
          </label>
        )}

        <input {...inputProps} ref={ref} />
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
