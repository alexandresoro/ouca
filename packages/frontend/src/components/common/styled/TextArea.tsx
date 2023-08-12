import { forwardRef, type ComponentPropsWithRef, type FunctionComponent } from "react";
import RequiredField from "./RequiredField";

type TextAreaProps = {
  textAreaClassName?: string;
  label?: string;
  labelTextClassName?: string;
} & ComponentPropsWithRef<"textarea">;

const TextArea: FunctionComponent<TextAreaProps> = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ textAreaClassName, label, labelTextClassName, ...inputProps }, ref) => {
    const { className, ...restInputProps } = inputProps;

    return (
      <div className={`form-control py-2 ${textAreaClassName ?? ""}`}>
        {label && (
          <label className="label py-1">
            <span className={`label-text ${labelTextClassName ?? ""}`}>
              {label}
              {inputProps.required && <RequiredField />}
            </span>
          </label>
        )}

        <textarea
          className={`textarea textarea-primary textarea-bordered ${className ?? ""}`}
          {...restInputProps}
          ref={ref}
        />
      </div>
    );
  }
);

export default TextArea;
