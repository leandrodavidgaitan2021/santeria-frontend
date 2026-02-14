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
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Person,
  LockOpen as LockOpenIcon,
  Lock as LockIcon,
  Key as KeyIcon,
  AdminPanelSettings,
  PersonAdd,
  Close,
} from "@mui/icons-material";
import type { User, RegisterUserData, UserRole } from "../../types";
import { userService } from "../../services/userService";
import { useNotify } from "../../hooks/useNotify";
import { useConfirm } from "../../hooks/useConfirm";

export const AdminUsers = () => {
  const [vendedores, setVendedores] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false); // Estado para el Modal
  const { confirm } = useConfirm();
  const { showMsg } = useNotify();

  const [formData, setFormData] = useState<RegisterUserData>({
    username: "",
    email: "",
    password: "",
    role: "vendedor",
  });

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
  }, [showMsg]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleCloseModal = () => {
    setOpenModal(false);
    setFormData({ username: "", email: "", password: "", role: "vendedor" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      await userService.registerUser(formData);
      showMsg("Usuario registrado con éxito", "success");
      handleCloseModal(); // Cierra y resetea
      await loadUsers();
    } catch (err: unknown) {
      const error = err as { message?: string };
      showMsg(error.message || "Error al guardar", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleBlock = async (id: number) => {
    const usuario = vendedores.find((v) => v.id === id);
    if (!usuario) return;

    const ok = await confirm({
      title: usuario.active ? "Bloquear Usuario" : "Activar Usuario",
      description: usuario.active
        ? "¿Seguro? El usuario no podrá entrar al sistema."
        : "¿Deseas restaurar el acceso de este usuario?",
      confirmText: usuario.active ? "Bloquear" : "Activar",
      severity: usuario.active ? "error" : "primary",
    });

    if (ok) {
      try {
        await userService.toggleBlock(id);
        showMsg("Estado actualizado correctamente", "success");
        await loadUsers();
      } catch (err: unknown) {
        const error = err as { message?: string };
        showMsg(error.message || "Error al cambiar estado", "error");
      }
    }
  };

  const handleResetPassword = async (id: number) => {
    const usuario = vendedores.find((v) => v.id === id);
    if (!usuario) return;

    const ok = await confirm({
      title: "Resetear Contraseña",
      description: `La clave de ${usuario.username} cambiará a '12345678'.`,
      confirmText: "Resetear",
      severity: "warning",
    });

    if (ok) {
      try {
        await userService.resetPassword(id);
        showMsg("Contraseña reseteada con éxito", "success");
      } catch (err: unknown) {
        const error = err as { message?: string };
        showMsg(error.message || "Error al resetear clave", "error");
      }
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={3}>
        {/* Encabezado con Botón de Nuevo Usuario */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 1 }}
        >
          <Typography variant="h4" fontWeight="bold" color="text.primary">
            Usuarios
          </Typography>
          <Button
            variant="contained"
            startIcon={<PersonAdd />}
            onClick={() => setOpenModal(true)}
            sx={{
              bgcolor: "#455a64",
              fontWeight: "bold",
              "&:hover": { bgcolor: "#37474f" },
            }}
          >
            Nuevo Usuario
          </Button>
        </Box>

        {/* Tabla de Usuarios */}
        <TableContainer
          component={Paper}
          sx={{ borderRadius: 3, boxShadow: 3, overflow: "hidden" }}
        >
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 8 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Table>
              <TableHead sx={{ bgcolor: "#f8f9fa" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>Usuario</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Rol</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Email</TableCell>
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
                    sx={{ opacity: v.active ? 1 : 0.6 }}
                  >
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        {v.role === "admin" ? (
                          <AdminPanelSettings
                            fontSize="small"
                            color="secondary"
                          />
                        ) : (
                          <Person
                            fontSize="small"
                            color={v.active ? "primary" : "disabled"}
                          />
                        )}
                        <Typography variant="body2" fontWeight="500">
                          {v.username}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={v.role.toUpperCase()}
                        size="small"
                        color={v.role === "admin" ? "secondary" : "default"}
                        variant={v.active ? "filled" : "outlined"}
                      />
                    </TableCell>
                    <TableCell>{v.email}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        size="small"
                        onClick={() => handleResetPassword(v.id)}
                        title="Resetear clave"
                      >
                        <KeyIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        color={v.active ? "warning" : "error"}
                        size="small"
                        onClick={() => handleToggleBlock(v.id)}
                        title={v.active ? "Bloquear" : "Desbloquear"}
                        sx={{ ml: 1 }}
                      >
                        {v.active ? (
                          <LockIcon fontSize="small" />
                        ) : (
                          <LockOpenIcon fontSize="small" />
                        )}
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TableContainer>
      </Stack>

      {/* --- MODAL PARA NUEVO USUARIO --- */}
      <Dialog
        open={openModal}
        onClose={actionLoading ? undefined : handleCloseModal}
        fullWidth
        maxWidth="xs"
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            Registrar Usuario
            <IconButton onClick={handleCloseModal} disabled={actionLoading}>
              <Close />
            </IconButton>
          </DialogTitle>

          <DialogContent dividers>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Nombre de Usuario"
                fullWidth
                required
                size="small"
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
                size="small"
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
                size="small"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
              <TextField
                select
                label="Rol asignado"
                fullWidth
                size="small"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value as UserRole })
                }
              >
                <MenuItem value="vendedor">Vendedor</MenuItem>
                <MenuItem value="admin">Administrador</MenuItem>
              </TextField>
            </Stack>
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={handleCloseModal}
              color="inherit"
              disabled={actionLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={actionLoading}
              sx={{ bgcolor: "#455a64", "&:hover": { bgcolor: "#37474f" } }}
            >
              {actionLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Guardar Usuario"
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};
