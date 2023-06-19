import {
  useController,
  type FieldPathByValue,
  type FieldValues,
  type PathValue,
  type UseControllerProps,
} from "react-hook-form";
import { type SetRequired } from "type-fest";
import Switch from "../styled/Switch";

type FormSwitchProps<TFieldValues extends FieldValues> = SetRequired<
  UseControllerProps<TFieldValues, FieldPathByValue<TFieldValues, boolean>>,
  "control"
> & {
  switchClassName?: string;
  label: string;
};

const FormSwitch = <TFieldValues extends FieldValues>(props: FormSwitchProps<TFieldValues>) => {
  const { label, name, control, rules, defaultValue, switchClassName } = props;

  const {
    field: { onChange, value, ...restField },
  } = useController({
    name,
    control,
    rules,
    defaultValue,
  });

  const onChangeValue = (value: boolean): void => {
    onChange(value as PathValue<TFieldValues, FieldPathByValue<TFieldValues, boolean>>);
  };

  return (
    <Switch
      {...restField}
      name={name}
      checked={value}
      onChange={onChangeValue}
      label={label}
      switchClassName={switchClassName}
    />
  );
};

export default FormSwitch;
