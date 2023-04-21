import { type ComponentPropsWithRef, type Key } from "react";
import { useController, type FieldValues, type UseControllerProps } from "react-hook-form";
import { type ConditionalKeys, type SetRequired } from "type-fest";
import Autocomplete from "../styled/select/Autocomplete";
import AutocompleteMultiple from "../styled/select/AutocompleteMultiple";

type FormAutocompleteProps<TFieldValues extends FieldValues, T extends object> = SetRequired<
  UseControllerProps<TFieldValues>,
  "control"
> & {
  renderValue: (value: T) => string;
  label: string;
  autocompleteClassName?: string;
  labelClassName?: string;
  labelTextClassName?: string;
  onInputChange?: (value: string) => void;
  inputProps?: Omit<ComponentPropsWithRef<"input">, "value" | "defaultValue">;
} & (
    | {
        data: T[] | null | undefined;
        multiple?: false;
        decorationKey?: ConditionalKeys<T, Key> & string;
        by: ConditionalKeys<T, Key> & string;
      }
    | { data: T[]; multiple: true; by: ConditionalKeys<T, Key> & string }
    | {
        data: (T & { id: Key })[] | null | undefined;
        multiple?: false;
        decorationKey?: ConditionalKeys<T, Key> & string;
        by?: ConditionalKeys<T, Key> & string;
      }
    | { data: (T & { id: Key })[]; multiple: true; by?: ConditionalKeys<T, Key> & string }
  );

const FormAutocomplete = <TFieldValues extends FieldValues, T extends object>(
  props: FormAutocompleteProps<TFieldValues, T>
) => {
  const {
    data,
    by,
    renderValue,
    onInputChange,
    name,
    label,
    defaultValue,
    control,
    rules,
    autocompleteClassName,
    labelClassName,
    labelTextClassName,
    multiple,
    inputProps,
  } = props;

  const {
    field: { ref, value, onChange },
  } = useController<TFieldValues>({
    name,
    control,
    rules,
    defaultValue,
  });

  if (multiple) {
    const handleOnChange = (newValue: T[]) => {
      onChange?.(newValue);
    };

    return (
      <AutocompleteMultiple
        ref={ref}
        inputProps={inputProps}
        label={label}
        data={data}
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
  } else {
    const handleOnChange = (newValue: T | null) => {
      onChange?.(newValue);
      onInputChange?.(newValue ? renderValue(newValue) : "");
    };

    return (
      <Autocomplete
        ref={ref}
        inputProps={inputProps}
        label={label}
        data={data}
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
  }
};

export default FormAutocomplete;
