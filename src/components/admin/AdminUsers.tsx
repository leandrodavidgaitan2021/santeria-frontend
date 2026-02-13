import { useState, useEffect, useCallback } from "react";
import {
  Container,
  Stack,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
} from "@mui/material";
import {
  GroupAdd,
  Person,
  LockOpen as LockOpenIcon,
  Lock as LockIcon,
  Key as KeyIcon,
} from "@mui/icons-material";
import type { User } from "../../types"; // Importamos tu interfaz
import { userService } from "../../services/userService";
import { useNotify } from "../../hooks/useNotify";
import { useConfirm } from "../../hooks/useConfirm";

export const AdminUsers = () => {
  const [vendedores, setVendedores] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const { confirm } = useConfirm(); // 2. Inicializar el hook
  const { showMsg } = useNotify();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  // 1. Definimos la función de carga con useCallback para que sea estable
  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await userService.getVendedores();
      setVendedores(data);
    } catch (err: unknown) {
      const error = err as { message?: string };
      showMsg(error.message || "Error al cargar", "error");
    } finally {
      setLoading(false);
    }
  }, [showMsg]); // Solo se recrea si showMsg cambia

  // 2. useEffect llama a la función memorizada al montar el componente
  useEffect(() => {
    loadUsers();
  }, [loadUsers]); // Ahora es seguro ponerla aquí

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);

    const ok = await confirm({
      title: "Registrar Vendedor",
      description: "¿Estás seguro de crear vendedor?",
      confirmText: "Crear",
      severity: "warning", // Color naranja
    });

    if (ok) {
      try {
        await userService.registerVendedor(formData);
        setFormData({ username: "", email: "", password: "" });
        showMsg("Vendedor registrado con éxito", "success");

        // 3. ¡Ahora podemos llamar a loadUsers para refrescar la tabla!
        await loadUsers();
      } catch (err: unknown) {
        const error = err as { message?: string };
        showMsg(error.message || "Error al guardar", "error");
      } finally {
        setActionLoading(false);
      }
    }
  };

  // Función para Bloquear/Desbloquear (Cambia el flag 'active')
  const handleToggleBlock = async (id: number) => {
    const vendedor = vendedores.find((v) => v.id === id);
    if (!vendedor) return;

    const ok = await confirm({
      title: vendedor.active ? "Bloquear Vendedor" : "Activar Vendedor",
      description: vendedor.active
        ? "¿Seguro? El usuario no podrá entrar al sistema."
        : "¿Deseas restaurar el acceso de este usuario?",
      confirmText: vendedor.active ? "Bloquear" : "Activar",
      severity: vendedor.active ? "error" : "primary",
    });

    if (ok) {
      try {
        await userService.toggleBlock(id); // Llamada al nuevo servicio
        showMsg("Estado actualizado correctamente", "success");
        await loadUsers(); // Esto hará que el icono cambie de LockOpen a Lock
      } catch (err: unknown) {
        const error = err as { message?: string };
        showMsg(error.message || "Error al cambiar estado", "error");
      }
    }
  };

  // Función para Resetear Clave (Solo cambia la contraseña a 12345678)
  const handleResetPassword = async (id: number) => {
    const vendedor = vendedores.find((v) => v.id === id);
    if (!vendedor) return;

    const ok = await confirm({
      title: "Resetear Contraseña",
      description: `La clave de ${vendedor.username} cambiará a '12345678'.\n¿Confirmar acción?`,
      confirmText: "Resetear",
      severity: "warning",
    });

    if (ok) {
      try {
        await userService.resetPassword(id);
        showMsg("Contraseña reseteada con éxito", "success");
        // Aquí no es estrictamente necesario loadUsers() porque active no cambia,
        // pero puedes hacerlo por seguridad.
      } catch (err: unknown) {
        const error = err as { message?: string };
        showMsg(error.message || "Error al resetear clave", "error");
      }
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 2 }}>
      <Stack spacing={4}>
        {/* Formulario de Alta */}
        <Paper
          elevation={3}
          sx={{ p: 4, borderRadius: 3, borderTop: "4px solid #455a64" }}
        >
          <Stack direction="row" spacing={1} alignItems="center" mb={3}>
            <GroupAdd sx={{ color: "#455a64" }} />
            <Typography variant="h5" fontWeight="bold">
              Gestión de Vendedores
            </Typography>
          </Stack>

          <form onSubmit={handleSubmit}>
            <Box
              display="grid"
              gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }}
              gap={2}
            >
              <TextField
                label="Nombre de Usuario"
                fullWidth
                required
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
              />
              <TextField
                label="Email"
                type="email"
                fullWidth
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
              <TextField
                label="Contraseña"
                type="password"
                fullWidth
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
              <TextField
                label="Rol asignado"
                value="Vendedor (user)"
                disabled
                helperText="Permisos limitados a Ventas y Artículos"
              />
              <Box sx={{ gridColumn: { sm: "span 2" }, mt: 1 }}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={actionLoading}
                  sx={{
                    py: 1.5,
                    fontWeight: "bold",
                    bgcolor: "#455a64",
                    "&:hover": { bgcolor: "#37474f" },
                  }}
                >
                  {actionLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Registrar Vendedor"
                  )}
                </Button>
              </Box>
            </Box>
          </form>
        </Paper>

        {/* Tabla de Usuarios */}
        <TableContainer
          component={Paper}
          sx={{ borderRadius: 3, boxShadow: 2 }}
        >
          <Box
            sx={{ p: 2, bgcolor: "#f8f9fa", borderBottom: "1px solid #eee" }}
          >
            <Typography variant="h6" fontWeight="600">
              Lista de Vendedores
            </Typography>
          </Box>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>Usuario</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Alta</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }} align="right">
                    Acciones
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vendedores.map((v) => (
                  <TableRow
                    key={v.id}
                    hover
                    sx={{
                      opacity: v.active ? 1 : 0.7,
                      bgcolor: v.active ? "inherit" : "rgba(0, 0, 0, 0.04)",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Person
                          fontSize="small"
                          color={v.active ? "primary" : "disabled"}
                        />
                        <Typography
                          variant="body2"
                          fontWeight="500"
                          sx={{
                            textDecoration: v.active ? "none" : "line-through",
                            color: v.active ? "text.primary" : "text.secondary",
                          }}
                        >
                          {v.username}
                        </Typography>
                        {!v.active && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: "error.main",
                              fontWeight: "bold",
                              ml: 1,
                            }}
                          >
                            (BLOQUEADO)
                          </Typography>
                        )}
                      </Stack>
                    </TableCell>

                    <TableCell
                      sx={{ color: v.active ? "inherit" : "text.disabled" }}
                    >
                      {v.email}
                    </TableCell>

                    <TableCell
                      sx={{ color: v.active ? "inherit" : "text.disabled" }}
                    >
                      {new Date(v.created_at).toLocaleDateString()}
                    </TableCell>

                    <TableCell align="right">
                      {/* BOTÓN 1: RESET PASSWORD (Independiente) */}
                      <IconButton
                        color="primary"
                        size="small"
                        onClick={() => handleResetPassword(v.id)}
                        title="Resetear clave a 12345678"
                        sx={{ mr: 1 }}
                      >
                        <KeyIcon />
                      </IconButton>

                      {/* BOTÓN 2: BLOQUEAR / DESBLOQUEAR */}
                      <IconButton
                        color={v.active ? "warning" : "error"}
                        size="small"
                        onClick={() => handleToggleBlock(v.id)}
                        title={
                          v.active ? "Bloquear Usuario" : "Desbloquear Usuario"
                        }
                      >
                        {v.active ? <LockIcon /> : <LockOpenIcon />}
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TableContainer>
      </Stack>
    </Container>
  );
};
