import { useState, useEffect, useContext } from "react";
import {
  Container,
  Box,
  Typography,
  Paper,
  Stack,
  CardActionArea,
  Button,
} from "@mui/material";
import {
  Inventory,
  Category,
  LocalShipping,
  ShoppingCart,
  ReceiptLong,
  AccountBalanceWallet,
  BarChart,
  ArrowBack,
  GroupAdd,
} from "@mui/icons-material";
import { Navbar } from "../components/Navbar";
import { AdminArticles } from "../components/admin/AdminArticles";
import { AdminCategories } from "../components/admin/AdminCategories";
import { AdminSales } from "../components/admin/AdminSales";
import { AdminPurchase } from "../components/admin/AdminPurchase";
import { AdminExtractions } from "../components/admin/AdminExtractions";
import { AdminStatistics } from "../components/admin/AdminStatistics";
import { AdminUsers } from "../components/admin/AdminUsers";
import { AdminProviders } from "../components/admin/AdminProviders";
import { AuthContext } from "../context/AuthContext";

const menuItems = [
  {
    id: "articulos",
    title: "Artículos",
    icon: <Inventory fontSize="large" />,
    color: "#1976d2",
  },
  {
    id: "categorias",
    title: "Categorías",
    icon: <Category fontSize="large" />,
    color: "#9c27b0",
  },
  {
    id: "proveedores",
    title: "Proveedores",
    icon: <LocalShipping fontSize="large" />,
    color: "#f85ed7",
  },
  {
    id: "ventas",
    title: "Ventas",
    icon: <ShoppingCart fontSize="large" />,
    color: "#2e7d32",
  },
  {
    id: "compras",
    title: "Compras",
    icon: <ReceiptLong fontSize="large" />,
    color: "#ed6c02",
  },
  {
    id: "extracciones",
    title: "Extracciones",
    icon: <AccountBalanceWallet fontSize="large" />,
    color: "#d32f2f",
  },
  {
    id: "estadisticas",
    title: "Estadísticas",
    icon: <BarChart fontSize="large" />,
    color: "#0288d1",
  },
  {
    id: "usuarios",
    title: "Vendedores",
    icon: <GroupAdd fontSize="large" />,
    color: "#455a64",
  },
];

export const AdminDashboard = () => {
  // Inicializamos el estado desde localStorage para no perder la vista actual
  const [activeView, setActiveView] = useState(() => {
    return localStorage.getItem("lastAdminView") || "menu";
  });

  const { isAdmin } = useContext(AuthContext);

  // Cada vez que activeView cambie, lo guardamos en el storage
  useEffect(() => {
    localStorage.setItem("lastAdminView", activeView);
  }, [activeView]);

  const filteredMenuItems = menuItems.filter((item) => {
    if (!isAdmin) {
      return ["ventas", "articulos"].includes(item.id);
    }
    return true;
  });

  const handleBackToMenu = () => setActiveView("menu");

  const renderMenu = () => (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: { xs: 2, sm: 3 },
        justifyContent: "center",
      }}
    >
      {filteredMenuItems.map((item) => (
        <Paper
          key={item.id}
          elevation={3}
          sx={{
            width: {
              xs: "100%",
              sm: "calc(50% - 24px)",
              md: "calc(33.3% - 24px)",
            },
            borderRadius: 2,
            overflow: "hidden",
            transition: "transform 0.2s",
            "&:hover": { transform: "scale(1.02)" },
          }}
        >
          <CardActionArea
            sx={{ p: { xs: 3, sm: 4 }, textAlign: "center" }}
            onClick={() => setActiveView(item.id)}
          >
            <Stack
              direction={{ xs: "row", sm: "column" }}
              alignItems="center"
              justifyContent={{ xs: "flex-start", sm: "center" }}
              spacing={2}
              sx={{ px: { xs: 2, sm: 0 } }}
            >
              <Box
                sx={{
                  color: item.color,
                  display: "flex",
                  "& svg": { fontSize: { xs: "1.8rem", sm: "2.5rem" } },
                }}
              >
                {item.icon}
              </Box>

              <Typography
                variant="h6"
                sx={{
                  fontWeight: "600",
                  fontSize: { xs: "0.95rem", sm: "1.25rem" },
                }}
              >
                {item.title}
              </Typography>
            </Stack>
          </CardActionArea>
        </Paper>
      ))}
    </Box>
  );

  const renderContent = () => {
    const restrictedViews = [
      "categorias",
      "proveedores",
      "compras",
      "extracciones",
      "estadisticas",
      "usuarios",
    ];

    if (!isAdmin && restrictedViews.includes(activeView)) {
      setActiveView("menu");
      return renderMenu();
    }

    switch (activeView) {
      case "articulos":
        return <AdminArticles />;
      case "categorias":
        return <AdminCategories />;
      case "proveedores":
        return <AdminProviders />;
      case "ventas":
        return <AdminSales />;
      case "compras":
        return <AdminPurchase />;
      case "extracciones":
        return <AdminExtractions />;
      case "estadisticas":
        return <AdminStatistics />;
      case "usuarios":
        return <AdminUsers />;
      default:
        return renderMenu();
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 1 }}>
      <Box sx={{ mb: { xs: 1, sm: 2 } }}>
        <Navbar />
      </Box>

      {activeView !== "menu" && (
        <Button
          startIcon={<ArrowBack sx={{ color: "#d32f2f" }} />}
          onClick={handleBackToMenu}
          sx={{
            mb: 1,
            fontWeight: "bold",
            fontSize: { xs: "0.75rem", sm: "0.85rem" },
            textTransform: "none",
            color: "text.secondary",
          }}
        >
          Volver {window.innerWidth > 450 && "al Menú Principal"}
        </Button>
      )}

      <Box sx={{ minHeight: "60vh" }}>{renderContent()}</Box>
    </Container>
  );
};
