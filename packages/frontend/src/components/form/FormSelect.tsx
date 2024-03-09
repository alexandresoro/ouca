import type { Key } from "react";
import { type FieldValues, type Path, type PathValue, type UseControllerProps, useController } from "react-hook-form";
import type { ConditionalKeys, SetRequired } from "type-fest";
import Select from "../base/select/Select";

type FormSelectProps<TFieldValues extends FieldValues, T, K extends ConditionalKeys<T, Key>> = SetRequired<
  UseControllerProps<TFieldValues>,
  "control"
> & {
  data: T[] | null | undefined;
  renderValue: (value: T) => string;
  label: string;
  required?: boolean;
  selectClassName?: string;
} & (T extends { id: Key }
    ? {
        by?: K;
      }
    : { by: K });

const FormSelect = <TFieldValues extends FieldValues, T, K extends ConditionalKeys<T, Key>>(
  props: FormSelectProps<TFieldValues, T, K>,
) => {
  const { data, by, renderValue, name, label, required, defaultValue, control, rules, selectClassName } = props;

  const {
    field: { ref, value, onChange, onBlur },
    fieldState: { error },
  } = useController({
    name,
    control,
    rules,
    defaultValue,
  });

  // TODO: try to improve type inference
  const key = by ?? ("id" as ConditionalKeys<T, Key>);

  const handleOnChange = (newValue: T) => {
    onChange(newValue[key] as PathValue<TFieldValues, Path<TFieldValues>>);
  };

  const selectedEntry = data?.find((entry) => entry[key] === value) ?? null;

  return (
    <Select
      ref={ref}
      label={label}
      required={required}
      data={data}
      // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
      by={by as K}
      value={selectedEntry}
      onChange={handleOnChange}
      onBlur={onBlur}
      renderValue={renderValue}
      selectClassName={selectClassName}
      hasError={!!error}
    />
  );
};

export default FormSelect;
