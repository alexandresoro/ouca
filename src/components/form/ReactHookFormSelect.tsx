import { FormControl, FormControlProps, InputLabel, Select } from "@mui/material";
import { PropsWithChildren } from "react";
import { Controller, UseControllerProps } from "react-hook-form";

type ReactHookFormSelectProps<TFieldValues> = UseControllerProps<TFieldValues> & {
  label: string;
  formControlProps?: FormControlProps;
};

const ReactHookFormSelect = <TFieldValues,>(props: PropsWithChildren<ReactHookFormSelectProps<TFieldValues>>) => {
  const { name, label, control, rules, children, formControlProps, ...restProps } = props;

  const labelId = `${name}-label`;

  return (
    <FormControl variant="standard" {...formControlProps}>
      <InputLabel id={labelId}>{label}</InputLabel>
      <Controller
        {...restProps}
        name={name}
        control={control}
        rules={rules}
        render={({ field }) => (
          <Select labelId={labelId} label={label} {...field}>
            {children}
          </Select>
        )}
      />
    </FormControl>
  );
};
export default ReactHookFormSelect;
