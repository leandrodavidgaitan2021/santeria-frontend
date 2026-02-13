import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Divider,
} from "@mui/material";
import { Menu as MenuIcon, Logout, Lock } from "@mui/icons-material"; // Añadimos Lock
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { ChangePasswordModal } from "./ChangePasswordModal"; // Importante

export const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Estados para menús y modales
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false); // Estado del modal

  const open = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate("/login");
  };

  // Abrir modal y cerrar menú (si es mobile)
  const handleOpenPasswordModal = () => {
    handleMenuClose();
    setIsPasswordModalOpen(true);
  };

  if (!isAuthenticated) return null;

  return (
    <>
      <AppBar
        position="sticky"
        sx={{
          bgcolor: "#2e7d32",
          m: { xs: 0, sm: 0 },
          boxShadow: { xs: 1, sm: 4 },
        }}
      >
        <Toolbar
          variant={window.innerWidth < 600 ? "dense" : "regular"}
          sx={{
            px: { xs: 1, sm: 3 },
            minHeight: { xs: "40px", sm: "64px" },
          }}
        >
          <Typography
            variant="h6"
            sx={{
              flexGrow: 1,
              fontSize: { xs: "0.9rem", sm: "1.25rem" },
              fontWeight: 600,
              letterSpacing: { xs: -0.5, sm: 0 },
            }}
          >
            Santería Oro Verde
          </Typography>

          {/* --- VISTA DESKTOP --- */}
          <Box
            sx={{
              display: { xs: "none", sm: "flex" },
              alignItems: "center",
              gap: 2,
            }}
          >
            <Typography variant="body2">
              Hola, <strong>{user?.username}</strong>
            </Typography>

            {/* Nuevo botón para cambiar contraseña en PC */}
            <Button
              color="inherit"
              onClick={handleOpenPasswordModal}
              startIcon={<Lock />}
              sx={{
                textTransform: "none",
                fontSize: "0.85rem",
                opacity: 0.9,
                "&:hover": { opacity: 1 },
              }}
            >
              Cambiar Clave
            </Button>

            <Button
              color="inherit"
              onClick={handleLogout}
              startIcon={<Logout />}
              sx={{
                textTransform: "none",
                border: "1px solid white",
                borderRadius: 2,
              }}
            >
              Salir
            </Button>
          </Box>

          {/* --- VISTA MOBILE --- */}
          <Box sx={{ display: { xs: "flex", sm: "none" } }}>
            <IconButton
              color="inherit"
              onClick={handleMenuOpen}
              size="small"
              sx={{ p: 0.5 }}
            >
              <MenuIcon fontSize="small" />
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleMenuClose}
              slotProps={{
                paper: {
                  sx: {
                    minWidth: "180px", // Un poco más ancho para que quepa el texto
                    mt: { xs: 0.5, sm: 1.5 },
                    boxShadow: (theme) => theme.shadows[2],
                  },
                },
              }}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <MenuItem disabled sx={{ py: 0.5, minHeight: "32px" }}>
                <Typography variant="caption" color="text.primary">
                  {user?.username}
                </Typography>
              </MenuItem>

              <Divider />

              {/* Opción nueva en el menú hamburguesa */}
              <MenuItem
                onClick={handleOpenPasswordModal}
                sx={{ py: 1, minHeight: "32px" }}
              >
                <Lock sx={{ mr: 1, fontSize: "1rem" }} />
                <Typography variant="body2">Cambiar Clave</Typography>
              </MenuItem>

              <MenuItem
                onClick={handleLogout}
                sx={{ py: 1, minHeight: "32px" }}
              >
                <Logout sx={{ mr: 1, fontSize: "1rem" }} />
                <Typography variant="body2">Salir</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Renderizado del Modal fuera del AppBar para evitar problemas de stacking */}
      <ChangePasswordModal
        open={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </>
  );
};
