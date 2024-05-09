import { Field, Label, Switch as SwitchHeadless } from "@headlessui/react";
import { type ForwardedRef, forwardRef } from "react";
import RequiredField from "./RequiredField";

type SwitchProps = {
  label: string;
  name?: string;
  checked?: boolean;
  required?: boolean;
  onChange?: (value: boolean) => void;
  switchClassName?: string;
};

const Switch = (props: SwitchProps, ref: ForwardedRef<HTMLButtonElement>) => {
  const { checked, required, switchClassName, label, name, onChange } = props;

  return (
    <Field className={`flex gap-4 p-1 justify-between ${switchClassName ?? ""}`}>
      <Label className="label-text cursor-pointer">
        {label} {required && <RequiredField />}
      </Label>
      <SwitchHeadless ref={ref} name={name} checked={checked} onChange={onChange} className="toggle toggle-primary" />
    </Field>
  );
};

export default forwardRef(Switch);
