import {
  Card, // Añadido
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Chip,
  Divider,
} from "@mui/material";
import { ShoppingCartOutlined, Inventory2Outlined } from "@mui/icons-material";
import type { Article } from "../types";

interface Props {
  product: Article;
}

export const ProductCard = ({ product }: Props) => {
  // Lógica para el color del stock
  const isOutOfStock = product.stock <= 0;
  const stockColor =
    product.stock > 10 ? "success" : product.stock > 0 ? "warning" : "error";
  const stockLabel = isOutOfStock
    ? "Sin stock"
    : `${product.stock} disponibles`;

  return (
    <Card
      elevation={3}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 3,
        overflow: "hidden",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "scale(1.02)",
          boxShadow: 6,
        },
      }}
    >
      <CardMedia
        component="img"
        height="180"
        image={`https://via.placeholder.com/300x200?text=${encodeURIComponent(product.title)}`}
        alt={product.title}
      />

      <CardContent
        sx={{ flexGrow: 1, p: 3, display: "flex", flexDirection: "column" }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 1,
            gap: 1,
          }}
        >
          <Typography
            variant="subtitle1"
            fontWeight="bold"
            sx={{ lineHeight: 1.2, flex: 1 }}
          >
            {product.title}
          </Typography>
          <Chip
            label={`$${product.final_price}`}
            color="primary"
            size="small"
            sx={{ fontWeight: "bold" }}
          />
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: "40px",
          }}
        >
          {product.content || "Sin descripción disponible."}
        </Typography>

        <Box sx={{ mt: "auto" }}>
          <Divider sx={{ my: 1.5 }} />

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Inventory2Outlined
              sx={{ fontSize: 16, color: "text.secondary" }}
            />
            <Typography
              variant="caption"
              fontWeight="bold"
              color={`${stockColor}.main`}
            >
              {stockLabel}
            </Typography>
          </Box>

          <Button
            fullWidth
            variant="contained"
            startIcon={<ShoppingCartOutlined />}
            disabled={isOutOfStock}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: "bold",
            }}
          >
            {isOutOfStock ? "Agotado" : "Añadir"}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};
