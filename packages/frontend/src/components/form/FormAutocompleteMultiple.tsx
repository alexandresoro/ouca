import { type ComponentPropsWithRef, type Key } from "react";
import {
  type FieldPathByValue,
  type FieldValues,
  type Path,
  type PathValue,
  type UseControllerProps,
  useController,
} from "react-hook-form";
import { type ConditionalKeys, type SetRequired } from "type-fest";
import AutocompleteMultiple from "../base/autocomplete/AutocompleteMultiple";

type FormAutocompleteMultipleProps<TFieldValues extends FieldValues, T extends object> = SetRequired<
  UseControllerProps<TFieldValues, FieldPathByValue<TFieldValues, T[]>>,
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
} & (
    | { data: T[]; by: ConditionalKeys<T, Key> & string }
    | { data: (T & { id: Key })[]; by?: ConditionalKeys<T, Key> & string }
  );

const FormAutocompleteMultiple = <TFieldValues extends FieldValues, T extends object>(
  props: FormAutocompleteMultipleProps<TFieldValues, T>
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

  const handleOnChange = (newValue: T[]) => {
    onChange?.(newValue as PathValue<TFieldValues, Path<TFieldValues>>);
  };

  return (
    <AutocompleteMultiple
      ref={ref}
      inputProps={inputProps}
      label={label}
      required={required}
      data={data}
      // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
      by={by as ConditionalKeys<T, Key> & string}
      values={value}
      onChange={handleOnChange}
      onInputChange={onInputChange}
      renderValue={renderValue}
      autocompleteClassName={autocompleteClassName}
      labelClassName={labelClassName}
      labelTextClassName={labelTextClassName}
    />
  );
};

export default FormAutocompleteMultiple;
