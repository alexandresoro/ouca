import { type Key } from "react";
import { useController, type FieldValues, type Path, type PathValue, type UseControllerProps } from "react-hook-form";
import { type ConditionalKeys, type SetRequired } from "type-fest";
import Select from "../styled/select/Select";

type FormSelectProps<TFieldValues extends FieldValues, T, K extends ConditionalKeys<T, Key>> = SetRequired<
  UseControllerProps<TFieldValues>,
  "control"
> & {
  data: T[] | null | undefined;
  renderValue: (value: T) => string;
  label: string;
  // rome-ignore lint/suspicious/noExplicitAny: <explanation>
  selectClassName?: any;
} & (T extends { id: Key }
    ? {
        by?: K;
      }
    : { by: K });

const FormSelect = <TFieldValues extends FieldValues, T, K extends ConditionalKeys<T, Key>>(
  props: FormSelectProps<TFieldValues, T, K>
) => {
  const { data, by, renderValue, name, label, defaultValue, control, rules, selectClassName } = props;

  const {
    field: { ref, value, onChange },
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
      data={data}
      by={by as K}
      value={selectedEntry}
      onChange={handleOnChange}
      renderValue={renderValue}
      selectClassName={selectClassName}
    />
  );
};

export default FormSelect;
