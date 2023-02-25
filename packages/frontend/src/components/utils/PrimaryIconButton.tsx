import { IconButton } from "@mui/material";
import { forwardRef } from "react";

const PrimaryIconButton = forwardRef<HTMLButtonElement>((props, ref) => (
  <IconButton className="text-teal-700 dark:text-white" {...props} ref={ref} />
));

export default PrimaryIconButton;
