import { type Key } from "react";
import { useController, type FieldValues, type UseControllerProps } from "react-hook-form";
import { type ConditionalKeys, type SetRequired } from "type-fest";
import Select from "../styled/Select";

type FormSelectProps<TFieldValues extends FieldValues, T, K extends ConditionalKeys<T, Key>> = SetRequired<
  UseControllerProps<TFieldValues>,
  "control"
> & {
  data: T[] | null | undefined;
  renderValue: (value: T) => string;
  label: string;
} & (T extends { id: Key }
    ? {
        by?: K;
      }
    : { by: K });

const FormSelect = <TFieldValues extends FieldValues, T, K extends ConditionalKeys<T, Key>>(
  props: FormSelectProps<TFieldValues, T, K>
) => {
  const { data, by, renderValue, name, label, defaultValue, control, rules } = props;

  const { field } = useController<TFieldValues>({
    name,
    control,
    rules,
    defaultValue,
  });

  return <Select label={label} data={data} by={by as K} {...field} renderValue={renderValue} />;
};

export default FormSelect;
