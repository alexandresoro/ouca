import { FormControlLabel, Switch } from "@mui/material";
import { Controller, UseControllerProps } from "react-hook-form";

type ReactHookFormSwitchProps<TFieldValues> = UseControllerProps<TFieldValues> & {
  label: string
}

const ReactHookFormSwitch = <TFieldValues,>(props: ReactHookFormSwitchProps<TFieldValues>) => {

  const { label, ...controllerProps } = props;

  return (
    <Controller
      {...controllerProps}
      render={({ field }) => (
        <FormControlLabel
          control={<Switch sx={{ marginTop: 1, marginBottom: 1 }} color="primary" {...field} checked={field.value === true} />}
          label={label}
        />
      )}
    />
  );
};

export default ReactHookFormSwitch;