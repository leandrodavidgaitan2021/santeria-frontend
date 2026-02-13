import { useState } from "react";
import type { ReactNode } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { ConfirmContext, type ConfirmOptions } from "../context/ConfirmContext";

export const ConfirmProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolveCallback, setResolveCallback] = useState<
    (value: boolean) => void
  >(() => {});

  const confirm = (opts: ConfirmOptions): Promise<boolean> => {
    setOptions(opts);
    setOpen(true);
    return new Promise((resolve) => {
      setResolveCallback(() => resolve);
    });
  };

  const handleClose = (value: boolean) => {
    setOpen(false);
    resolveCallback(value);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <Dialog
        open={open}
        onClose={() => handleClose(false)}
        fullWidth
        maxWidth="xs"
        // Asegura que el diálogo esté por encima de otros modales si es necesario
        slotProps={{ backdrop: { sx: { backgroundColor: "rgba(0,0,0,0.4)" } } }}
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>{options?.title}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ whiteSpace: "pre-line" }}>
            {options?.description}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 3 }}>
          <Button onClick={() => handleClose(false)} color="inherit">
            {options?.cancelText || "Cancelar"}
          </Button>
          <Button
            onClick={() => handleClose(true)}
            variant="contained"
            color={options?.severity || "primary"}
            autoFocus
          >
            {options?.confirmText || "Aceptar"}
          </Button>
        </DialogActions>
      </Dialog>
    </ConfirmContext.Provider>
  );
};
