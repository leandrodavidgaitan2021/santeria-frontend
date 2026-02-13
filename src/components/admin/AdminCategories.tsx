import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Divider,
  CircularProgress,
} from "@mui/material";
import { Add, Edit, Category as CatIcon } from "@mui/icons-material";
import { useCategories } from "../../hooks/useCategory";
import { useNotify } from "../../hooks/useNotify"; // Importa el hook

export const AdminCategories = () => {
  const { categories, addCategory, updateCategory, loading } = useCategories();
  const { showMsg } = useNotify(); // Inicializa

  // Estados para el Modal (Dialog)
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const handleOpen = (id: number | null = null, currentName = "") => {
    setSelectedId(id);
    setName(currentName);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setName("");
    setSelectedId(null);
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;

    try {
      if (selectedId) {
        await updateCategory(selectedId, name);
        showMsg("Categoría actualizada con éxito");
      } else {
        await addCategory(name);
        showMsg("Categoría creada correctamente");
      }
      handleClose();
    } catch (err: unknown) {
      // Usamos una aserción simple o comprobamos si es objeto para leer .message
      const mensaje =
        (err as { message?: string })?.message || "Error inesperado";
      showMsg(mensaje, "error");
    }
  };

  return (
    <Box sx={{ p: { xs: 0.5, sm: 1 } }}>
      {/* Cabecera Compacta */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography
          variant="h6"
          fontWeight="bold"
          sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}
        >
          Gestión de Categorías
        </Typography>
        <Button
          size="small"
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpen()}
          sx={{ bgcolor: "#2e7d32", textTransform: "none" }}
        >
          Nueva
        </Button>
      </Stack>

      {/* Lista de Categorías */}
      <Paper elevation={1} sx={{ borderRadius: 2, overflow: "hidden" }}>
        {loading ? (
          <Box p={3} textAlign="center">
            <CircularProgress size={24} color="success" />
          </Box>
        ) : (
          <List sx={{ py: 0 }}>
            {categories.map((cat, i) => (
              <Box key={cat.id}>
                <ListItem
                  secondaryAction={
                    <IconButton
                      size="small"
                      onClick={() => handleOpen(cat.id, cat.name)}
                      color="primary"
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                  }
                  sx={{
                    py: { xs: 0.8, sm: 1.2 },
                    px: { xs: 1.5, sm: 2 },
                  }}
                >
                  <CatIcon
                    sx={{
                      mr: 1.5,
                      fontSize: "1.2rem",
                      color: "text.secondary",
                    }}
                  />
                  <ListItemText
                    primary={cat.name}
                    primaryTypographyProps={{
                      fontSize: { xs: "0.9rem", sm: "1rem" },
                      fontWeight: 500,
                    }}
                  />
                </ListItem>
                {i < categories.length - 1 && <Divider variant="middle" />}
              </Box>
            ))}
            {categories.length === 0 && !loading && (
              <Typography
                sx={{
                  p: 2,
                  textAlign: "center",
                  color: "text.secondary",
                  fontSize: "0.9rem",
                }}
              >
                No hay categorías registradas
              </Typography>
            )}
          </List>
        )}
      </Paper>

      {/* Modal de Formulario */}
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="xs"
        slotProps={{ paper: { sx: { borderRadius: 2 } } }}
      >
        <DialogTitle sx={{ fontSize: "1.1rem", fontWeight: "bold" }}>
          {selectedId ? "Editar Categoría" : "Nueva Categoría"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            size="small"
            label="Nombre de la categoría"
            placeholder="Ej: Velas, Sahumerios..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button
            onClick={handleClose}
            size="small"
            sx={{ color: "text.secondary" }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            size="small"
            color="success"
            disabled={!name.trim()}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
