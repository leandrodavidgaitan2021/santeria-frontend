import { Container, Typography, Paper, Box, Stack } from "@mui/material";
import {
  TrendingUp,
  Inventory,
  WarningAmber,
  People,
} from "@mui/icons-material";
import { Navbar } from "../components/Navbar";

export const AdminDashboard = () => {
  const stats = [
    {
      title: "Ventas del Día",
      value: "$45.000",
      icon: <TrendingUp />,
      color: "#2e7d32",
    },
    {
      title: "Stock Total",
      value: "124",
      icon: <Inventory />,
      color: "#0288d1",
    },
    {
      title: "Stock Bajo",
      value: "8",
      icon: <WarningAmber />,
      color: "#ed6c02",
    },
    { title: "Clientes", value: "12", icon: <People />, color: "#9c27b0" },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Navbar />
      </Box>

      {/* Contenedor de Tarjetas con Flexbox */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 3,
          mb: 4,
        }}
      >
        {stats.map((stat, index) => (
          <Paper
            key={index}
            elevation={2}
            sx={{
              p: 3,
              borderRadius: 3,
              flex: "1 1 250px", // Crece, se achica y tiene un mínimo de 250px
              display: "flex",
              alignItems: "center",
              gap: 2,
              borderLeft: `6px solid ${stat.color}`,
            }}
          >
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: `${stat.color}15`,
                color: stat.color,
                display: "flex",
              }}
            >
              {stat.icon}
            </Box>
            <Stack>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight="medium"
              >
                {stat.title}
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {stat.value}
              </Typography>
            </Stack>
          </Paper>
        ))}
      </Box>

      {/* Área de Contenido Principal */}
      <Paper
        sx={{
          p: 4,
          borderRadius: 4,
          minHeight: "400px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "2px dashed",
          borderColor: "divider",
        }}
      >
        <Typography variant="h6" color="text.secondary">
          Aquí cargaremos la tabla de productos usando ArticleService
        </Typography>
      </Paper>
    </Container>
  );
};
