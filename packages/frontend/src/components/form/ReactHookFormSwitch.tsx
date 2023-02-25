import { FormControlLabel, Switch } from "@mui/material";
import { Controller, type FieldValues, type UseControllerProps } from "react-hook-form";

type ReactHookFormSwitchProps<TFieldValues extends FieldValues> = UseControllerProps<TFieldValues> & {
  label: string;
};

const ReactHookFormSwitch = <TFieldValues extends FieldValues>(props: ReactHookFormSwitchProps<TFieldValues>) => {
  const { label, ...controllerProps } = props;

  return (
    <Controller
      {...controllerProps}
      render={({ field }) => (
        <FormControlLabel
          control={<Switch className="my-2" color="primary" {...field} checked={field.value === true} />}
          label={label}
        />
      )}
    />
  );
};

export default ReactHookFormSwitch;
