import { type Key } from "react";
import { useController, type FieldValues, type UseControllerProps } from "react-hook-form";
import { type ConditionalKeys, type SetRequired } from "type-fest";
import Autocomplete from "../styled/select/Autocomplete";

type FormAutocompleteProps<
  TFieldValues extends FieldValues,
  T,
  K extends ConditionalKeys<T, Key> & string
> = SetRequired<UseControllerProps<TFieldValues>, "control"> & {
  data: T[] | null | undefined;
  renderValue: (value: T) => string;
  label: string;
  autocompleteClassName?: string;
  onInputChange?: (value: string) => void;
  decorationKey?: K;
} & (T extends { id: Key }
    ? {
        by?: K;
      }
    : { by: K });

const FormAutocomplete = <TFieldValues extends FieldValues, T, K extends ConditionalKeys<T, Key> & string>(
  props: FormAutocompleteProps<TFieldValues, T, K>
) => {
  const {
    data,
    by,
    decorationKey,
    renderValue,
    onInputChange,
    name,
    label,
    defaultValue,
    control,
    rules,
    autocompleteClassName,
  } = props;

  const {
    field: { ref, value, onChange },
  } = useController<TFieldValues>({
    name,
    control,
    rules,
    defaultValue,
  });

  const handleOnChange = (newValue: T | null) => {
    onChange?.(newValue);
    onInputChange?.(newValue ? renderValue(newValue) : "");
  };

  const handleOnFocus = (currentValue: T | null) => {
    if (currentValue) {
      onInputChange?.(renderValue(currentValue));
    }
  };

  return (
    <Autocomplete
      ref={ref}
      label={label}
      data={data}
      by={by as K}
      decorationKey={decorationKey}
      value={value}
      onChange={handleOnChange}
      onFocus={handleOnFocus}
      onInputChange={onInputChange}
      renderValue={renderValue}
      autocompleteClassName={autocompleteClassName}
    />
  );
};

export default FormAutocomplete;
