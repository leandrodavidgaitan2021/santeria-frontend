import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { articleService } from "../services/articleService";
import { ProductCard } from "../components";
import type { Article } from "../types";

export const Store = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Estados para productos
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carga de productos desde el backend Flask
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await articleService.getAll();
        setArticles(data);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los productos. Intenta más tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header adaptable */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 2,
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold" color="primary">
            Santería Parroquial
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Bienvenido, {user?.username}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 2 }}>
          {user?.role === "admin" && (
            <Button
              variant="contained"
              color="secondary"
              onClick={() => navigate("/admin/dashboard")}
            >
              Panel Admin
            </Button>
          )}
          <Button onClick={logout} variant="outlined" color="error">
            Salir
          </Button>
        </Box>
      </Box>

      {/* Manejo de Estados de Carga y Error */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
          <CircularProgress />
        </Box>
      )}

      {error && <Alert severity="error">{error}</Alert>}

      {/* Contenedor de Productos con Flexbox (Sin Grid) */}
      {!loading && !error && (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 3,
            justifyContent: "center",
          }}
        >
          {articles.map((article) => (
            <Box
              key={article.id}
              sx={{
                flex: "1 1 280px", // Base de 280px, crece y se ajusta solo
                maxWidth: { xs: "100%", sm: "320px" },
              }}
            >
              <ProductCard product={article} />
            </Box>
          ))}

          {articles.length === 0 && (
            <Typography variant="body1" sx={{ mt: 4, color: "text.secondary" }}>
              No hay productos disponibles en este momento.
            </Typography>
          )}
        </Box>
      )}
    </Container>
  );
};
