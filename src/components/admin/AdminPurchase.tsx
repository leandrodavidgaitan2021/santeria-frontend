import { useEffect, useState, useMemo } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Stack,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputAdornment,
} from "@mui/material";
import { Add, Search } from "@mui/icons-material";
import { useArticles } from "../../hooks/useArticles";
import { useProviders } from "../../hooks/useProviders";
import { useNotify } from "../../hooks/useNotify";
import { purchaseService } from "../../services/purchaseService";
import type { PurchaseResponse, ShoppingItem } from "../../types/purchase";

// Importamos los nuevos componentes
import { PurchaseRow } from "./PurchaseRow";
import { PurchaseDialog } from "./PurchaseDialog";

export const AdminPurchase = () => {
  const { articles, fetchArticles } = useArticles();
  const { providers } = useProviders();
  const { showMsg } = useNotify();

  const [purchases, setPurchases] = useState<PurchaseResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [providerId, setProviderId] = useState("");
  const [cart, setCart] = useState<ShoppingItem[]>([]);
  const [currentItem, setCurrentItem] = useState<ShoppingItem>({
    article_id: 0,
    title: "",
    units: 1,
    unit_price: 0,
    profit_margin: 0,
    final_price: 0,
  });

  const loadHistory = async () => {
    try {
      const data = await purchaseService.getAll();
      setPurchases(data);
    } catch (err: unknown) {
      const error = err as { message?: string };
      showMsg(error.message || "Error al guardar", "error");
    }
  };

  useEffect(() => {
    // Definimos una bandera para evitar fugas de memoria si el componente se desmonta

    let isMounted = true;

    const fetchData = async () => {
      try {
        const data = await purchaseService.getAll();

        if (isMounted) {
          setPurchases(data);
        }
      } catch (err: unknown) {
        const error = err as { message?: string };

        if (isMounted) {
          showMsg(error.message || "Error al guardar", "error");
        }
      }
    };

    fetchData();

    // Función de limpieza

    return () => {
      isMounted = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredPurchases = useMemo(() => {
    return purchases.filter(
      (p) =>
        p.provider_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        new Date(p.date).toLocaleDateString().includes(searchTerm),
    );
  }, [purchases, searchTerm]);

  const handleSaveAll = async () => {
    try {
      await purchaseService.savePurchase({
        provider_id: providerId,
        items: cart,
      });
      showMsg("¡Compra registrada!");
      setOpenModal(false);
      setCart([]);
      setProviderId("");
      fetchArticles();
      loadHistory();
    } catch (err: unknown) {
      const error = err as { message?: string };
      showMsg(error.message || "Error al guardar", "error");
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" fontWeight="bold" color="primary" mb={3}>
        Gestión de Compras
      </Typography>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        mb={3}
        justifyContent="space-between"
      >
        <TextField
          placeholder="Buscar proveedor o fecha..."
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenModal(true)}
        >
          Nueva Compra
        </Button>
      </Stack>

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: "#f5f5f5" }}>
            <TableRow>
              <TableCell width={50} />
              <TableCell>Fecha</TableCell>
              <TableCell>Proveedor</TableCell>
              <TableCell align="right">Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPurchases.map((p) => (
              <PurchaseRow key={p.id} purchase={p} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <PurchaseDialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        providers={providers}
        articles={articles}
        cart={cart}
        currentItem={currentItem}
        providerId={providerId}
        setProviderId={setProviderId}
        setCurrentItem={setCurrentItem}
        addToCart={() => {
          if (!currentItem.article_id)
            return showMsg("Selecciona un artículo", "error");
          setCart([...cart, currentItem]);
          setCurrentItem({
            article_id: 0,
            title: "",
            units: 1,
            unit_price: 0,
            profit_margin: 0,
            final_price: 0,
          });
        }}
        removeFromCart={(index) => setCart(cart.filter((_, i) => i !== index))}
        onSave={handleSaveAll}
      />
    </Box>
  );
};
