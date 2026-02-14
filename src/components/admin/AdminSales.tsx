import { useEffect, useState, useMemo, useContext, useCallback } from "react";
import { AuthContext } from "../../context/AuthContext";
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
import { useNotify } from "../../hooks/useNotify";
import { useConfirm } from "../../hooks/useConfirm";
import { saleService } from "../../services/saleService";
import type { SaleResponse, SaleItem } from "../../types/sales";
import { SaleDialog } from "./SalesDialog";
import { SaleRow } from "./SalesRow";

export const AdminSales = () => {
  const { user, isAdmin } = useContext(AuthContext);
  const { articles, fetchArticles } = useArticles();
  const { showMsg } = useNotify();
  const { confirm } = useConfirm();

  const [sales, setSales] = useState<SaleResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Estados del Formulario
  const [clientName, setClientName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<
    "EFECTIVO" | "TRANSFERENCIA" | ""
  >("");
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [currentItem, setCurrentItem] = useState<SaleItem>({
    article_id: 0,
    title: "",
    units: 1,
    unit_price: 0,
  });

  const loadHistory = useCallback(async () => {
    try {
      const data = await saleService.getAll();
      setSales(data);
    } catch (err: unknown) {
      const error = err as { message?: string };
      showMsg(error.message || "Error al cargar Historial", "error");
    }
  }, [showMsg]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleConfirmSale = async () => {
    if (cart.length === 0 || paymentMethod === "") return;

    const total = cart.reduce(
      (acc, item) => acc + item.unit_price * item.units,
      0,
    );
    const ok = await confirm({
      title: "Confirmar Venta",
      description: `Total: $${total.toLocaleString()} - Método: ${paymentMethod}`,
      confirmText: "Confirmar",
      severity: "primary",
    });

    if (!ok) return;

    setActionLoading(true);
    try {
      await saleService.saveSale({
        client_name: clientName,
        items: cart,
        payment_method: paymentMethod,
      });

      showMsg("Venta exitosa", "success");
      setOpenModal(false);

      // Reset total
      setCart([]);
      setClientName("");
      setPaymentMethod("");

      await Promise.all([fetchArticles(), loadHistory()]);
      
    } catch (err: unknown) {
      const error = err as { message?: string };
      showMsg(error.message || "Error al cargar ", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseModal = () => {
    if (!actionLoading) {
      setOpenModal(false);
      setPaymentMethod(""); // Reset para la próxima vez que abra
    }
  };

  const filteredSales = useMemo(() => {
    const base = isAdmin
      ? sales
      : sales.filter((s) => Number(s.user_id) === Number(user?.id));
    return base.filter(
      (s) =>
        s.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.payment_method?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [sales, searchTerm, isAdmin, user]);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" fontWeight="bold" color="primary" mb={3}>
        Punto de Venta
      </Typography>

      <Stack direction="row" spacing={2} mb={3} justifyContent="space-between">
        <TextField
          placeholder="Buscar venta..."
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
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
          Nueva Venta
        </Button>
      </Stack>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead sx={{ bgcolor: "#f5f5f5" }}>
            <TableRow>
              <TableCell width={50} />
              <TableCell>Fecha</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Método</TableCell>
              <TableCell>Vendedor</TableCell>{" "}
              {/* Si agregaste la columna de vendedor */}
              <TableCell align="center">Total</TableCell>
              <TableCell align="center">PDF</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSales.map((s) => (
              <SaleRow key={s.id} sale={s} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <SaleDialog
        open={openModal}
        loading={actionLoading}
        onClose={handleCloseModal}
        articles={articles}
        cart={cart}
        currentItem={currentItem}
        clientName={clientName}
        setClientName={setClientName}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        setCurrentItem={setCurrentItem}
        addToCart={() => {
          // 1. Buscamos si el producto ya está en el carrito
          const existingItemIndex = cart.findIndex(
            (item) => item.article_id === currentItem.article_id,
          );

          // 2. Buscamos el artículo en la lista maestra para validar stock final
          const articleInfo = articles.find(
            (a) => a.id === currentItem.article_id,
          );
          if (!articleInfo) return;

          if (existingItemIndex > -1) {
            const newCart = [...cart];
            const newTotalUnits =
              newCart[existingItemIndex].units + currentItem.units;

            // 3. Validación de seguridad: No permitir sumar más del stock real
            if (newTotalUnits > articleInfo.stock) {
              showMsg(
                `No puedes agregar más de ${articleInfo.stock} unidades en total`,
                "error",
              );
              return;
            }

            newCart[existingItemIndex] = {
              ...newCart[existingItemIndex],
              units: newTotalUnits,
            };
            setCart(newCart);
          } else {
            // 4. Si no existía, simplemente lo agregamos
            setCart([...cart, currentItem]);
          }

          // 5. Resetear el selector
          setCurrentItem({ article_id: 0, title: "", units: 1, unit_price: 0 });
        }}
        removeFromCart={(idx) => {
          setCart(cart.filter((_, i) => i !== idx));
          // Opcional: resetear el selector actual si era el mismo producto
          setCurrentItem({ article_id: 0, title: "", units: 1, unit_price: 0 });
        }}
        onSave={handleConfirmSale}
      />
    </Box>
  );
};
