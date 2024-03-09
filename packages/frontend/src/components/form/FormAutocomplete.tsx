import type { ComponentPropsWithRef, Key } from "react";
import {
  type FieldPathByValue,
  type FieldValues,
  type Path,
  type PathValue,
  type UseControllerProps,
  useController,
} from "react-hook-form";
import type { ConditionalKeys, SetRequired } from "type-fest";
import Autocomplete from "../base/autocomplete/Autocomplete";

type FormAutocompleteProps<TFieldValues extends FieldValues, T extends object> = SetRequired<
  UseControllerProps<TFieldValues, FieldPathByValue<TFieldValues, T | null>>,
  "control"
> & {
  renderValue: (value: T) => string;
  label: string;
  required?: boolean;
  autocompleteClassName?: string;
  labelClassName?: string;
  labelTextClassName?: string;
  onInputChange?: (value: string) => void;
  inputProps?: Omit<ComponentPropsWithRef<"input">, "value" | "defaultValue">;
  decorationKey?: ConditionalKeys<T, string | number> & Key;
} & (
    | {
        data: T[] | null | undefined;
        by: ConditionalKeys<T, Key> & string;
      }
    | {
        data: (T & { id: Key })[] | null | undefined;
        by?: ConditionalKeys<T, Key> & string;
      }
  );

const FormAutocomplete = <TFieldValues extends FieldValues, T extends object>(
  props: FormAutocompleteProps<TFieldValues, T>,
) => {
  const {
    data,
    by,
    renderValue,
    onInputChange,
    name,
    label,
    required,
    defaultValue,
    control,
    rules,
    autocompleteClassName,
    labelClassName,
    labelTextClassName,
    inputProps,
  } = props;

  const {
    field: { ref, value, onChange },
  } = useController({
    name,
    control,
    rules,
    defaultValue,
  });

  const handleOnChange = (newValue: T | null) => {
    onChange?.(newValue as PathValue<TFieldValues, Path<TFieldValues>>);
    onInputChange?.(newValue ? renderValue(newValue) : "");
  };

  return (
    <Autocomplete
      ref={ref}
      inputProps={inputProps}
      label={label}
      required={required}
      data={data}
      // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
      by={by as ConditionalKeys<T, Key> & string}
      decorationKey={props.decorationKey}
      value={value}
      onChange={handleOnChange}
      onInputChange={onInputChange}
      renderValue={renderValue}
      autocompleteClassName={autocompleteClassName}
      labelClassName={labelClassName}
      labelTextClassName={labelTextClassName}
    />
  );
};

export default FormAutocomplete;
