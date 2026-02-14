import { useState, useContext, type ChangeEvent } from "react";
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
  Avatar,
} from "@mui/material";
import {
  Add,
  Edit,
  Inventory as ArtIcon,
  PhotoCamera,
  Delete,
} from "@mui/icons-material";
import { AuthContext } from "../../context/AuthContext";
import { useArticles } from "../../hooks/useArticles";
import { useCategories } from "../../hooks/useCategory";
import { useProviders } from "../../hooks/useProviders";
import { useNotify } from "../../hooks/useNotify";
import { useConfirm } from "../../hooks/useConfirm";
import type { Article } from "../../types";

interface ArticleFormState {
  title: string;
  content: string;
  unit_price: number;
  profit_margin: number;
  final_price: number;
  stock: number;
  category_id: number | "";
  provider_id: number | "";
  image: File | null;
}

export interface ArticleSubmissionData {
  title: string;
  content: string;
  unit_price: number;
  profit_margin: number;
  final_price: number;
  stock: number;
  category_id: number;
  provider_id: number;
  image: File | null;
}

export const AdminArticles = () => {
  const { isAdmin } = useContext(AuthContext);
  const { articles, addArticle, updateArticle, loading } = useArticles();
  const { categories } = useCategories();
  const { providers } = useProviders();
  const { confirm } = useConfirm();
  const { showMsg } = useNotify();

  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState<ArticleFormState>({
    title: "",
    content: "",
    unit_price: 0,
    profit_margin: 0,
    final_price: 0,
    stock: 0,
    category_id: "",
    provider_id: "",
    image: null,
  });

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const calculateFinal = (price: number, margin: number): number => {
    return Math.round(price * (1 + margin / 100));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData((prev) => ({ ...prev, image: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleOpen = (article: Article | null = null) => {
    setPreview(null);
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
        image: null,
      });
      if (article.image_url) {
        setPreview(`${API_URL}${article.image_url}`);
      }
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
        image: null,
      });
    }
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!isAdmin) {
      showMsg("No tienes permisos", "error");
      return;
    }

    if (
      !formData.title ||
      formData.category_id === "" ||
      formData.provider_id === ""
    ) {
      showMsg("Completa los campos obligatorios", "error");
      return;
    }

    const submission: ArticleSubmissionData = {
      ...formData,
      category_id: formData.category_id as number,
      provider_id: formData.provider_id as number,
    };

    const isEditing = !!selectedId;
    const ok = await confirm({
      title: isEditing ? "Confirmar Actualización" : "Confirmar Nuevo Artículo",
      description: `¿Estás seguro de guardar "${formData.title}"?`,
      confirmText: isEditing ? "Actualizar" : "Crear",
      severity: isEditing ? "primary" : "warning",
    });

    if (!ok) return;

    setActionLoading(true);

    try {
      if (selectedId) {
        await updateArticle(selectedId, submission);
        showMsg("Artículo actualizado", "success");
      } else {
        await addArticle(submission);
        showMsg("Artículo creado", "success");
      }
      setOpen(false);
    } catch (err: unknown) {
      const error = err as Error;
      showMsg(error.message || "Error al procesar", "error");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 0, sm: 1 } }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        spacing={1}
        mb={1}
      >
        <Typography variant="h5" fontWeight="bold" color="primary.main">
          Inventario de Santería
        </Typography>

        {isAdmin && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpen()}
            color="success"
            size="small"
            sx={{ textTransform: "none" }}
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
                  sx={{ py: 1 }}
                  secondaryAction={
                    isAdmin && (
                      <IconButton
                        onClick={() => handleOpen(art)}
                        color="primary"
                        size="small"
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    )
                  }
                >
                  <Avatar
                    variant="rounded"
                    src={art.image_url ? `${API_URL}${art.image_url}` : ""}
                    sx={{ mr: 2, width: 40, height: 40, bgcolor: "grey.100" }}
                  >
                    <ArtIcon fontSize="small" />
                  </Avatar>

                  <ListItemText
                    primary={
                      <Typography variant="body2" fontWeight="500">
                        {art.title}
                      </Typography>
                    }
                    secondary={`Stock: ${art.stock} | ${art.category?.name || "S/C"}`}
                  />

                  <Typography
                    variant="body2"
                    sx={{ fontWeight: "800", mr: 2, color: "#e65100" }}
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

      <Dialog
        open={open}
        onClose={() => !actionLoading && setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: "bold", fontSize: "1.1rem", py: 1.5 }}>
          {selectedId ? "Editar" : "Nuevo"} Artículo
        </DialogTitle>

        <DialogContent dividers sx={{ py: 2 }}>
          <Stack spacing={1.5}>
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              gap={1}
              mb={0.5}
            >
              {preview ? (
                <Box position="relative">
                  <Box
                    component="img"
                    src={preview}
                    sx={{
                      width: 100,
                      height: 100,
                      borderRadius: 2,
                      objectFit: "cover",
                      border: "1px solid #ddd",
                    }}
                  />
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => {
                      setPreview(null);
                      setFormData((prev) => ({ ...prev, image: null }));
                    }}
                    sx={{
                      position: "absolute",
                      top: -8,
                      right: -8,
                      bgcolor: "white",
                      boxShadow: 1,
                      p: 0.5,
                    }}
                  >
                    <Delete fontSize="inherit" />
                  </IconButton>
                </Box>
              ) : (
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  startIcon={<PhotoCamera />}
                  size="small"
                  sx={{
                    py: 2,
                    borderStyle: "dashed",
                    flexDirection: "column",
                    fontSize: "0.75rem",
                  }}
                >
                  Subir Foto
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </Button>
              )}
            </Box>

            <TextField
              label="Nombre del Producto"
              fullWidth
              size="small"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />

            <TextField
              label="Descripción"
              fullWidth
              multiline
              rows={2}
              size="small"
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
            />

            <Stack direction="row" spacing={1}>
              <TextField
                label="Costo ($)"
                type="number"
                size="small"
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
              />
              <TextField
                label="Margen (%)"
                type="number"
                size="small"
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
              />
              <TextField
                label="Final ($)"
                type="number"
                size="small"
                fullWidth
                value={formData.final_price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    final_price: Number(e.target.value),
                  })
                }
              />
            </Stack>

            <Stack direction="row" spacing={1}>
              <TextField
                label="Stock"
                type="number"
                size="small"
                fullWidth
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: Number(e.target.value) })
                }
              />
              <TextField
                select
                label="Categoría"
                fullWidth
                size="small"
                value={formData.category_id}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category_id:
                      e.target.value === "" ? "" : Number(e.target.value),
                  })
                }
              >
                {categories.map((c) => (
                  <MenuItem
                    key={c.id}
                    value={c.id}
                    sx={{ fontSize: "0.85rem" }}
                  >
                    {c.name}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>

            <TextField
              select
              label="Proveedor"
              fullWidth
              size="small"
              value={formData.provider_id}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  provider_id:
                    e.target.value === "" ? "" : Number(e.target.value),
                })
              }
            >
              {providers.map((p) => (
                <MenuItem key={p.id} value={p.id} sx={{ fontSize: "0.85rem" }}>
                  {p.name}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button
            onClick={() => setOpen(false)}
            disabled={actionLoading}
            size="small"
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            color="success"
            disabled={actionLoading}
            size="small"
            sx={{ minWidth: 90 }}
          >
            {actionLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Guardar"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
