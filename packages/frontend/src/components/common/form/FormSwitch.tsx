import { useController, type FieldValues, type UseControllerProps } from "react-hook-form";
import { type SetRequired } from "type-fest";
import Switch from "../styled/Switch";

type FormSwitchProps<TFieldValues extends FieldValues> = SetRequired<UseControllerProps<TFieldValues>, "control"> & {
  switchClassName?: string;
  label: string;
};

const FormSwitch = <TFieldValues extends FieldValues>(props: FormSwitchProps<TFieldValues>) => {
  const { label, name, control, rules, defaultValue, switchClassName } = props;

  const { field } = useController<TFieldValues>({
    name,
    control,
    rules,
    defaultValue,
  });

  return <Switch checked={field.value} label={label} {...field} switchClassName={switchClassName} />;
};

export default FormSwitch;
