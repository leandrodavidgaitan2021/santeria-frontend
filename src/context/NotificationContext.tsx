// src/context/NotificationContext.tsx
import { createContext } from "react";
import type { AlertColor } from "@mui/material";

interface NotificationContextType {
  msg: string;
  severity: AlertColor;
  open: boolean;
  showMsg: (msg: string, severity?: AlertColor) => void;
  hideMsg: () => void;
}

export const NotificationContext = createContext<
  NotificationContextType | undefined
>(undefined);
