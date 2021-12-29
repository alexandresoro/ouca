import { AlertColor } from "@mui/material";
import { Dispatch, useState } from "react";

type SnackbarContentType = {
  timestamp?: number;
  type?: AlertColor;
  message?: string;
};

export default function useSnackbarContent(): [SnackbarContentType, Dispatch<Omit<SnackbarContentType, "timestamp">>] {
  const [timestamp, setTimestamp] = useState<number | undefined>(undefined);
  const [type, setType] = useState<AlertColor | undefined>(undefined);
  const [message, setMessage] = useState<string | undefined>(undefined);

  const setSnackbarContent = (content: Omit<SnackbarContentType, "timestamp">): void => {
    setTimestamp(content ? new Date().getTime() : undefined);
    setType(content?.type ?? undefined);
    setMessage(content?.message ?? undefined);
  };

  return [
    {
      timestamp,
      type,
      message
    },
    setSnackbarContent
  ];
}
