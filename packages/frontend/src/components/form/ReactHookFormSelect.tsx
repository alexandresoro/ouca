import { FormControl, FormControlProps, InputLabel, Select } from "@mui/material";
import { PropsWithChildren } from "react";
import { Controller, FieldValues, UseControllerProps } from "react-hook-form";

type ReactHookFormSelectProps<TFieldValues extends FieldValues> = UseControllerProps<TFieldValues> & {
  label: string;
  formControlProps?: FormControlProps;
};

const ReactHookFormSelect = <TFieldValues extends FieldValues>(
  props: PropsWithChildren<ReactHookFormSelectProps<TFieldValues>>
) => {
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
