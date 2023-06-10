import { Switch as SwitchHeadless } from "@headlessui/react";
import { forwardRef, type ForwardedRef } from "react";

type SwitchProps = {
  label: string;
  name?: string;
  checked?: boolean;
  onChange?: (value: boolean) => void;
  switchClassName?: string;
};

const Switch = (props: SwitchProps, ref: ForwardedRef<HTMLButtonElement>) => {
  const { checked, switchClassName, label, name, onChange } = props;

  return (
    <SwitchHeadless.Group as="div" className={`flex gap-4 p-1 justify-between ${switchClassName ?? ""}`}>
      <SwitchHeadless.Label className="label-text cursor-pointer">{label}</SwitchHeadless.Label>
      <SwitchHeadless ref={ref} name={name} checked={checked} onChange={onChange} className="toggle toggle-primary" />
    </SwitchHeadless.Group>
  );
};

export default forwardRef(Switch);
