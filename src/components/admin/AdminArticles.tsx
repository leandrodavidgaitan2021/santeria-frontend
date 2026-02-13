// AdminArticles.tsx
import { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext"; // Ajusta la ruta a tu AuthContext
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
  MenuItem,
} from "@mui/material";
import { Add, Edit, Inventory as ArtIcon } from "@mui/icons-material";
import { useArticles } from "../../hooks/useArticles";
import { useCategories } from "../../hooks/useCategory";
import { useProviders } from "../../hooks/useProviders";
import { useNotify } from "../../hooks/useNotify";
import type { Article } from "../../types";

interface ArticleForm {
  title: string;
  content: string; // Obligatorio para la DB
  unit_price: number;
  profit_margin: number;
  final_price: number;
  stock: number;
  category_id: number | "";
  provider_id: number | "";
}

export const AdminArticles = () => {
  const { isAdmin } = useContext(AuthContext); // Extraemos el booleano
  const { articles, addArticle, updateArticle, loading } = useArticles();
  const { categories } = useCategories();
  const { providers } = useProviders();
  const { showMsg } = useNotify();

  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [formData, setFormData] = useState<ArticleForm>({
    title: "",
    content: "",
    unit_price: 0,
    profit_margin: 0,
    final_price: 0,
    stock: 0,
    category_id: "",
    provider_id: "",
  });

  // Función auxiliar para calcular precio redondeado
  const calculateFinal = (price: number, margin: number) => {
    return Math.round(price * (1 + margin / 100));
  };

  const handleOpen = (article: Article | null = null) => {
    if (article) {
      setSelectedId(article.id);
      setFormData({
        title: article.title,
        content: article.content || "",
        unit_price: article.unit_price,
        profit_margin: article.profit_margin,
        final_price: article.final_price,
        stock: article.stock,
        category_id: article.category_id,
        provider_id: article.provider_id,
      });
    } else {
      setSelectedId(null);
      setFormData({
        title: "",
        content: "",
        unit_price: 0,
        profit_margin: 0,
        final_price: 0,
        stock: 0,
        category_id: "",
        provider_id: "",
      });
    }
    setOpen(true);
  };

  const handleSubmit = async () => {
    // Bloqueo de seguridad en la función
    if (!isAdmin) {
      showMsg("No tienes permisos para realizar esta acción", "error");
      return;
    }
    if (
      !formData.title ||
      formData.category_id === "" ||
      formData.provider_id === ""
    ) {
      showMsg("Por favor completa los campos obligatorios", "error");
      return;
    }

    const submissionData: Partial<Article> = {
      ...formData,
      category_id: Number(formData.category_id),
      provider_id: Number(formData.provider_id),
      // Enviamos el final_price que ya está en el estado (calculado al escribir)
    };

    try {
      if (selectedId) {
        await updateArticle(selectedId, submissionData);
        showMsg("Artículo actualizado");
      } else {
        await addArticle(submissionData);
        showMsg("Artículo creado");
      }
      setOpen(false);
    } catch (err: unknown) {
      const error = err as { message?: string };
      showMsg(error.message || "Error al guardar", "error");
    }
  };

  return (
    <Box sx={{ p: { xs: 0, sm: 1 } }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }} // stretch hace que el botón ocupe el ancho en móvil
        spacing={1}
        mb={1}
      >
        <Typography
          variant="h5"
          fontWeight="bold"
          color="primary.main"
          sx={{ fontSize: { xs: "1.2rem", sm: "1.5rem" } }} // Achicamos la fuente manualmente
        >
          Inventario de Santería
        </Typography>

        {/* RESTRICCIÓN 1: Ocultar o deshabilitar botón Nuevo */}
        {isAdmin && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpen()}
            color="success"
            // Usamos sx para controlar el tamaño y padding en lugar de la prop size
            sx={{
              py: { xs: 0.5, sm: 1 },
              px: { xs: 2, sm: 3 },
              fontSize: { xs: "0.8rem", sm: "0.9rem" },
              textTransform: "none", // Opcional: evita que esté todo en mayúsculas
            }}
          >
            Nuevo Artículo
          </Button>
        )}
      </Stack>

      <Paper elevation={2} sx={{ borderRadius: 2 }}>
        {loading ? (
          <Box p={4} textAlign="center">
            <CircularProgress size={30} />
          </Box>
        ) : (
          <List disablePadding>
            {articles.map((art, index) => (
              <Box key={art.id}>
                <ListItem
                  sx={{ py: 0.8 }} // Reducido de 1.5 a 0.8 (menos espacio entre filas)
                  secondaryAction={
                    /* RESTRICCIÓN 2: Solo mostrar botón Editar si es Admin */
                    isAdmin && (
                      <IconButton
                        edge="end"
                        onClick={() => handleOpen(art)}
                        color="primary"
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    )
                  }
                >
                  <ArtIcon sx={{ mr: 2, color: "text.secondary" }} />
                  <ListItemText
                    primary={art.title}
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {`Stock: ${art.stock} `}

                        {/* Este componente se oculta en celular */}
                        <Box
                          component="span"
                          sx={{ display: { xs: "none", sm: "inline" } }}
                        >
                          {`| Costo: $${art.unit_price || "S/N"}  `}
                          {`| Categoría: ${art.category?.name || "S/N"}  `}
                          {`| Proveedor: ${art.provider?.name || "S/N"}`}
                        </Box>
                      </Typography>
                    }
                    sx={{ my: 0 }}
                  />
                  <Typography
                    variant="subtitle1" // Un punto más grande que subtitle2
                    sx={{
                      fontWeight: "800", // Más grueso para que resalte
                      mr: 1,
                      // Opción A: Verde éxito (más común en precios)
                      //color: "success.main",

                      // Opción B: Azul marca (más sobrio)
                      //olor: "primary.main",

                      // Opción C: Un naranja fuerte (resalta mucho)
                      color: "#e65100",

                      backgroundColor: "rgba(46, 125, 50, 0.08)", // Un fondo muy sutil para resaltar el área
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      minWidth: "50px",
                      textAlign: "right",
                    }}
                  >
                    ${art.final_price.toLocaleString()}
                  </Typography>
                </ListItem>
                {index < articles.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        )}
      </Paper>
      {/* RESTRICCIÓN 3: El Dialog podría cerrarse o no permitir guardar si no es admin */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: "bold", pb: 1 }}>
          {" "}
          {/* Menos padding abajo del título */}
          {selectedId ? "Editar" : "Nuevo"} Artículo
        </DialogTitle>

        <DialogContent dividers sx={{ pt: 2, pb: 1 }}>
          {" "}
          {/* Padding interno ajustado */}
          <Stack spacing={1.8} sx={{ mt: 0.5 }}>
            {" "}
            {/* Separación entre inputs más moderada */}
            <TextField
              label="Nombre del Producto"
              fullWidth
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
            <TextField
              label="Contenido / Descripción"
              fullWidth
              multiline
              rows={2}
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
            />
            <Stack direction="row" spacing={1.5}>
              <TextField
                label="Costo ($)"
                type="number"
                fullWidth
                value={formData.unit_price}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setFormData({
                    ...formData,
                    unit_price: val,
                    final_price: calculateFinal(val, formData.profit_margin),
                  });
                }}
                // Esta línea selecciona el contenido al hacer foco
                onFocus={(e) => e.target.select()}
              />
              <TextField
                label="Margen (%)"
                type="number"
                fullWidth
                value={formData.profit_margin}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setFormData({
                    ...formData,
                    profit_margin: val,
                    final_price: calculateFinal(formData.unit_price, val),
                  });
                }}
                // Esta línea selecciona el contenido al hacer foco
                onFocus={(e) => e.target.select()}
              />
              <TextField
                label="Precio Final ($)"
                type="number"
                fullWidth
                value={formData.final_price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    final_price: Number(e.target.value),
                  })
                }
                sx={{
                  backgroundColor: "#f9f9f9",
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#ddd" },
                  },
                }}
                // Esta línea selecciona el contenido al hacer foco
                onFocus={(e) => e.target.select()}
              />
            </Stack>
            <Stack direction="row" spacing={1.5}>
              <TextField
                label="Stock"
                type="number"
                fullWidth
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: Number(e.target.value) })
                }
                // Esta línea selecciona el contenido al hacer foco
                onFocus={(e) => e.target.select()}
              />
              <TextField
                select
                label="Categoría"
                fullWidth
                value={formData.category_id}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category_id: Number(e.target.value), // Convertimos a número directamente
                  })
                }
              >
                {categories.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
            <TextField
              select
              label="Proveedor"
              fullWidth
              value={formData.provider_id}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  provider_id: Number(e.target.value), // Convertimos a número directamente
                })
              }
            >
              {providers.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          {/* Ocultamos el botón guardar en el modal por si el usuario llega a abrirlo */}
          {isAdmin && (
            <Button variant="contained" onClick={handleSubmit} color="success">
              Guardar
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};
