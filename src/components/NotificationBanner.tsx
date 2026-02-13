// src/components/NotificationBanner.tsx
import { Snackbar, Alert } from "@mui/material";
import { useNotify } from "../hooks/useNotify";

export const NotificationBanner = () => {
  const { msg, severity, open, hideMsg } = useNotify();

  return (
    <Snackbar
      open={open}
      autoHideDuration={4000}
      onClose={hideMsg}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert
        onClose={hideMsg}
        severity={severity}
        variant="filled"
        sx={{ width: "100%" }}
      >
        {msg}
      </Alert>
    </Snackbar>
  );
};
