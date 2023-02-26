import { IconButton, type IconButtonProps } from "@mui/material";
import { forwardRef } from "react";

const PrimaryIconButton = forwardRef<HTMLButtonElement, IconButtonProps>((props, ref) => (
  <IconButton className="text-primary dark:text-white" {...props} ref={ref} />
));

export default PrimaryIconButton;
