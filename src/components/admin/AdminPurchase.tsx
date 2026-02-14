import { useEffect, useState, useMemo, useCallback } from "react";
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
import { useConfirm } from "../../hooks/useConfirm";
import { purchaseService } from "../../services/purchaseService";
import type { PurchaseResponse, ShoppingItem } from "../../types/purchase";

import { PurchaseRow } from "./PurchaseRow";
import { PurchaseDialog } from "./PurchaseDialog";

export const AdminPurchase = () => {
  const { articles, fetchArticles } = useArticles();
  const { providers } = useProviders();
  const { showMsg } = useNotify();
  const { confirm } = useConfirm();

  const [purchases, setPurchases] = useState<PurchaseResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // --- Estado del Formulario ---
  const [providerId, setProviderId] = useState<string | number>("");

  // CORRECCIÓN: Inicializamos vacío para forzar selección
  const [paymentMethod, setPaymentMethod] = useState<
    "EFECTIVO" | "TRANSFERENCIA" | ""
  >("");

  // --- Nuevo Estado para la Fecha ---
  const [purchaseDate, setPurchaseDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const [cart, setCart] = useState<ShoppingItem[]>([]);
  const [currentItem, setCurrentItem] = useState<ShoppingItem>({
    article_id: 0,
    title: "",
    units: 1,
    unit_price: 0,
    profit_margin: 0,
    final_price: 0,
  });

  const loadHistory = useCallback(async () => {
    try {
      const data = await purchaseService.getAll();
      setPurchases(data);
    } catch (err: unknown) {
      const error = err as { message?: string };
      showMsg(error.message || "Error al cargar el historial", "error");
    }
  }, [showMsg]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleSaveAll = async () => {
    if (!providerId) return showMsg("Debes seleccionar un proveedor", "error");
    if (cart.length === 0) return showMsg("El carrito está vacío", "error");
    if (paymentMethod === "")
      return showMsg("Selecciona un método de pago", "error");
    if (!purchaseDate) return showMsg("Selecciona una fecha válida", "error");

    const totalCompra = cart.reduce(
      (acc, item) => acc + item.unit_price * item.units,
      0,
    );

    const ok = await confirm({
      title: "Confirmar Ingreso de Mercadería",
      description: `¿Estás seguro de registrar esta compra?\nFecha: ${new Date(purchaseDate).toLocaleDateString()}\nTotal: $${totalCompra.toLocaleString()}\nMétodo de Pago: ${paymentMethod}`,
      confirmText: "Registrar Compra",
      severity: "primary",
    });

    if (!ok) return;

    setActionLoading(true);
    try {
      await purchaseService.savePurchase({
        provider_id: providerId,
        payment_method: paymentMethod,
        date: purchaseDate, // <--- Enviamos la fecha seleccionada
        items: cart,
      });

      showMsg("¡Compra registrada correctamente!", "success");
      setOpenModal(false);

      // Limpiar Formulario
      setCart([]);
      setProviderId("");
      setPaymentMethod("");
      setPurchaseDate(new Date().toISOString().split("T")[0]); // Reset a hoy

      await Promise.all([fetchArticles(), loadHistory()]);
    } catch (err: unknown) {
      const error = err as { message?: string };
      showMsg(error.message || "Error al procesar la compra", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseModal = () => {
    if (!actionLoading) {
      setOpenModal(false);
      setPaymentMethod(""); // Reset para la próxima vez
      setProviderId("");
    }
  };

  const filteredPurchases = useMemo(() => {
    return purchases.filter((p) => {
      const search = searchTerm.toLowerCase();
      return (
        p.provider_name.toLowerCase().includes(search) ||
        new Date(p.date).toLocaleDateString().includes(search) ||
        p.payment_method?.toLowerCase().includes(search)
      );
    });
  }, [purchases, searchTerm]);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" fontWeight="bold" color="primary" mb={3}>
        Gestión de Compras
      </Typography>

      <Stack direction="row" spacing={2} mb={3} justifyContent="space-between">
        <TextField
          placeholder="Buscar proveedor, fecha..."
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: { sm: 350 } }}
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
        <Table size="small">
          <TableHead sx={{ bgcolor: "#f5f5f5" }}>
            <TableRow>
              <TableCell width={50} />
              <TableCell sx={{ fontWeight: "bold" }}>Fecha</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Proveedor</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Método</TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold" }}>
                Total
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPurchases.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  align="center"
                  sx={{ py: 3, color: "text.secondary" }}
                >
                  No se encontraron registros de compras
                </TableCell>
              </TableRow>
            ) : (
              filteredPurchases.map((p) => (
                <PurchaseRow key={p.id} purchase={p} />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <PurchaseDialog
        open={openModal}
        onClose={handleCloseModal}
        providers={providers}
        articles={articles}
        cart={cart}
        currentItem={currentItem}
        providerId={providerId}
        setProviderId={setProviderId}
        // --- Nuevas Props de Fecha ---
        purchaseDate={purchaseDate}
        setPurchaseDate={setPurchaseDate}
        // ----------------------------
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
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
        removeFromCart={(index) =>
          !actionLoading && setCart(cart.filter((_, i) => i !== index))
        }
        onSave={handleSaveAll}
        loading={actionLoading}
      />
    </Box>
  );
};
