import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
} from "@mui/material";
import axios from "axios"; // Importante para la validación del error
import { authService } from "../services/authService";
import { useNotify } from "../hooks/useNotify";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
}

export const ChangePasswordModal = ({
  open,
  onClose,
}: ChangePasswordModalProps) => {
  const { logout } = useAuth(); // Obtenemos la función de cierre de sesión
  const navigate = useNavigate();

  const { showMsg } = useNotify();
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Función para resetear todo y cerrar
  const handleClose = () => {
    setOldPassword("");
    setPassword("");
    setConfirmPassword("");
    setError("");
    onClose();
  };

  const handleSubmit = async (): Promise<void> => {
    setError("");

    if (password.length < 8) {
      return setError("La clave debe tener al menos 8 caracteres");
    }
    if (password !== confirmPassword) {
      return setError("Las claves no coinciden");
    }

    setLoading(true);
    try {
      await authService.changePassword({
        old_password: oldPassword,
        new_password: password,
      });

      showMsg("Contraseña actualizada con éxito");
      // 2. Esperamos 2 segundos antes de ejecutar el logout y la redirección
      setTimeout(() => {
        handleClose(); // Limpia estados del modal
        logout(); // Borra el token y el usuario del estado global
        navigate("/login"); // Redirige a la pantalla de acceso
      }, 2000);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        // Tipado seguro para la respuesta de Axios
        const message =
          err.response?.data?.message || "Error al cambiar la clave";
        setError(message);
      } else {
        setError("Error de conexión inesperado");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle>Cambiar Contraseña</DialogTitle>
      <DialogContent
        sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}
      >
        {error && <Alert severity="error">{error}</Alert>}

        <TextField
          label="Contraseña Actual"
          type="password"
          fullWidth
          value={oldPassword}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setOldPassword(e.target.value)
          }
        />
        <TextField
          label="Nueva Contraseña"
          type="password"
          fullWidth
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setPassword(e.target.value)
          }
        />
        <TextField
          label="Confirmar Contraseña"
          type="password"
          fullWidth
          value={confirmPassword}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setConfirmPassword(e.target.value)
          }
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="inherit">
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !password || !oldPassword}
        >
          {loading ? "Guardando..." : "Cambiar Clave"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
