import { useState } from "react";
import type { ReactNode } from "react";

import { NotificationContext } from "./NotificationContext";
import type { AlertColor } from "@mui/material";

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const [severity, setSeverity] = useState<AlertColor>("success");

  const showMsg = (message: string, sev: AlertColor = "success") => {
    setMsg(message);
    setSeverity(sev);
    setOpen(true);
  };

  const hideMsg = () => setOpen(false);

  return (
    <NotificationContext.Provider
      value={{ msg, severity, open, showMsg, hideMsg }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
