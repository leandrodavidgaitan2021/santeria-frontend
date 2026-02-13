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
import { Add, Edit, LocalShipping as ProviderIcon } from "@mui/icons-material";
import { useProviders } from "../../hooks/useProviders"; // Necesitarás crear este hook
import { useNotify } from "../../hooks/useNotify";

export const AdminProviders = () => {
  const { providers, addProvider, updateProvider, loading } = useProviders();
  const { showMsg } = useNotify();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const handleOpen = (
    id: number | null = null,
    currentName = "",
    currentContact = "",
  ) => {
    setSelectedId(id);
    setName(currentName);
    setContactInfo(currentContact);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setName("");
    setContactInfo("");
    setSelectedId(null);
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;

    try {
      const providerData = { name, contact_info: contactInfo };

      if (selectedId) {
        await updateProvider(selectedId, providerData);
        showMsg("Proveedor actualizado con éxito");
      } else {
        await addProvider(providerData);
        showMsg("Proveedor registrado correctamente");
      }
      handleClose();
    } catch (err: unknown) {
      const mensaje =
        (err as { message?: string })?.message || "Error inesperado";
      showMsg(mensaje, "error");
    }
  };

  return (
    <Box sx={{ p: { xs: 0.5, sm: 1 } }}>
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
          Gestión de Proveedores
        </Typography>
        <Button
          size="small"
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpen()}
          sx={{ bgcolor: "#1976d2", textTransform: "none" }} // Azul para diferenciar de categorías
        >
          Nuevo
        </Button>
      </Stack>

      <Paper elevation={1} sx={{ borderRadius: 2, overflow: "hidden" }}>
        {loading ? (
          <Box p={3} textAlign="center">
            <CircularProgress size={24} />
          </Box>
        ) : (
          <List sx={{ py: 0 }}>
            {providers.map((prov, i) => (
              <Box key={prov.id}>
                <ListItem
                  secondaryAction={
                    <IconButton
                      size="small"
                      onClick={() =>
                        handleOpen(prov.id, prov.name, prov.contact_info || "")
                      }
                      color="primary"
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                  }
                  sx={{ py: { xs: 0.8, sm: 1.2 }, px: { xs: 1.5, sm: 2 } }}
                >
                  <ProviderIcon
                    sx={{
                      mr: 1.5,
                      fontSize: "1.2rem",
                      color: "text.secondary",
                    }}
                  />
                  <ListItemText
                    primary={prov.name}
                    secondary={prov.contact_info}
                    primaryTypographyProps={{
                      fontSize: { xs: "0.9rem", sm: "1rem" },
                      fontWeight: 500,
                    }}
                    secondaryTypographyProps={{
                      fontSize: "0.8rem",
                      noWrap: true,
                    }}
                  />
                </ListItem>
                {i < providers.length - 1 && <Divider variant="middle" />}
              </Box>
            ))}
            {providers.length === 0 && !loading && (
              <Typography
                sx={{
                  p: 2,
                  textAlign: "center",
                  color: "text.secondary",
                  fontSize: "0.9rem",
                }}
              >
                No hay proveedores registrados
              </Typography>
            )}
          </List>
        )}
      </Paper>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontSize: "1.1rem", fontWeight: "bold" }}>
          {selectedId ? "Editar Proveedor" : "Nuevo Proveedor"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              autoFocus
              fullWidth
              size="small"
              label="Nombre de la empresa/proveedor"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              fullWidth
              multiline
              rows={2}
              size="small"
              label="Información de contacto"
              placeholder="Teléfono, Email o Dirección..."
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
            />
          </Stack>
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
            disabled={!name.trim()}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
