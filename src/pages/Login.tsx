import { useState } from "react";
// Importa SyntheticEvent
import type { SyntheticEvent } from "react";
import {
  TextField,
  Button,
  Typography,
  Paper,
  Box,
  Container,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { authService } from "../services/authService";
import axios from "axios";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Estados
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Llamamos al servicio primero
      const dataFromServer = await authService.login({ username, password });

      // 2. Guardamos en el contexto (que ahora devuelve los mismos datos)
      login(dataFromServer);

      // 3. Usamos la data del servidor para navegar (aquí ya no habrá error de 'void')
      if (
        dataFromServer.user.role === "admin" ||
        dataFromServer.user.role === "vendedor"
      ) {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    } catch (err: unknown) {
      console.error(err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Credenciales incorrectas");
      } else {
        setError("Error de conexión. Inténtalo de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f5f5f5",
        p: 2,
      }}
    >
      <Container maxWidth="xs">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            borderRadius: 4,
          }}
        >
          <Typography
            variant="h4"
            component="h3"
            sx={{ fontWeight: "bold", color: "#2e7d32", mb: 1 }}
          >
            Santeria
          </Typography>
          <Typography
            variant="h4"
            component="h3"
            sx={{ fontWeight: "bold", color: "#2e7d32", mb: 1 }}
          >
            Parroquia Oro Verde
          </Typography>

          {/* Mostrar error si existe */}
          {error && (
            <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Usuario"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                bgcolor: "#2e7d32",
                fontWeight: "bold",
                "&:hover": { bgcolor: "#1b5e20" },
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Entrar"
              )}
            </Button>

            <Box sx={{ textAlign: "center", mt: 1 }}>
              <Typography variant="caption">
                Para recuperar contraseña comuniquese con Administrador
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
