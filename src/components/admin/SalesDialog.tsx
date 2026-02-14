import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Stack,
  TextField,
  Divider,
  Autocomplete,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
  Typography,
  CircularProgress,
  MenuItem,
} from "@mui/material";
import { Close, Add, Delete, PointOfSale } from "@mui/icons-material";
import type { SaleItem } from "../../types/sales";
import type { Article } from "../../types";

interface Props {
  open: boolean;
  onClose: () => void;
  articles: Article[];
  cart: SaleItem[];
  currentItem: SaleItem;
  clientName: string;
  setClientName: (v: string) => void;
  paymentMethod: "EFECTIVO" | "TRANSFERENCIA" | "";
  setPaymentMethod: (v: "EFECTIVO" | "TRANSFERENCIA" | "") => void;
  setCurrentItem: (item: SaleItem) => void;
  addToCart: () => void;
  removeFromCart: (index: number) => void;
  onSave: () => void;
  loading?: boolean;
}

export const SaleDialog = ({
  open,
  onClose,
  articles,
  cart,
  currentItem,
  clientName,
  setClientName,
  paymentMethod,
  setPaymentMethod,
  setCurrentItem,
  addToCart,
  removeFromCart,
  onSave,
  loading = false,
}: Props) => {
  // 1. Cálculo del total de la venta actual en el carrito
  const totalSale = cart.reduce(
    (acc, item) => acc + item.units * item.unit_price,
    0,
  );

  // 2. Lógica de Stock Inteligente
  // Buscamos el artículo seleccionado en la lista maestra
  const selectedArticle = articles.find((a) => a.id === currentItem.article_id);

  // Calculamos cuántas unidades de este artículo ya están en la tabla (carrito)
  const unitsInCart = cart
    .filter((item) => item.article_id === currentItem.article_id)
    .reduce((acc, item) => acc + item.units, 0);

  // El stock disponible real es el stock total menos lo que ya se "reservó" en el carrito
  const availableStock = selectedArticle
    ? selectedArticle.stock - unitsInCart
    : 0;

  // Error si el usuario intenta agregar más de lo que queda disponible
  const isStockExceeded = currentItem.units > availableStock;

  // Validación para finalizar: carrito con items, método de pago elegido y no estar cargando
  const canFinalize = cart.length > 0 && paymentMethod !== "" && !loading;

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontWeight: "bold",
          bgcolor: "primary.main",
          color: "white",
        }}
      >
        Registrar Venta
        <IconButton
          onClick={onClose}
          disabled={loading}
          sx={{ color: "white" }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Nombre del Cliente"
            fullWidth
            size="small"
            value={clientName}
            disabled={loading}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Consumidor Final"
          />

          <Divider sx={{ fontWeight: "bold" }}>Productos</Divider>

          <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
            <Autocomplete
              sx={{ flexGrow: 1 }}
              // Filtramos para no mostrar productos sin stock de entrada
              options={articles.filter((a) => a.stock > 0)}
              disabled={loading}
              getOptionLabel={(o) =>
                `${o.title} | Stock: ${o.stock} | $${o.final_price.toLocaleString()}`
              }
              size="small"
              value={selectedArticle || null}
              onChange={(_, v) =>
                v &&
                setCurrentItem({
                  ...currentItem,
                  article_id: v.id,
                  title: v.title,
                  unit_price: v.final_price,
                  units: 1,
                })
              }
              renderInput={(params) => (
                <TextField {...params} label="Buscar Artículo" />
              )}
            />
            <TextField
              label="Cant"
              type="number"
              size="small"
              sx={{ width: { md: 100 } }}
              value={currentItem.units}
              error={isStockExceeded}
              helperText={isStockExceeded ? `Máx: ${availableStock}` : ""}
              onChange={(e) =>
                setCurrentItem({
                  ...currentItem,
                  units: Number(e.target.value),
                })
              }
            />
            <Button
              variant="contained"
              color="secondary"
              onClick={addToCart}
              disabled={
                !currentItem.article_id ||
                loading ||
                isStockExceeded ||
                currentItem.units <= 0
              }
            >
              <Add />
            </Button>
          </Stack>

          <TableContainer
            sx={{
              maxHeight: 300,
              border: "1px solid #ddd",
              borderRadius: 1,
              bgcolor: "#fafafa",
            }}
          >
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", bgcolor: "#eee" }}>
                    Producto
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: "bold", bgcolor: "#eee" }}
                  >
                    Cant
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ fontWeight: "bold", bgcolor: "#eee" }}
                  >
                    Precio Unit.
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ fontWeight: "bold", bgcolor: "#eee" }}
                  >
                    Subtotal
                  </TableCell>
                  <TableCell width={40} sx={{ bgcolor: "#eee" }} />
                </TableRow>
              </TableHead>
              <TableBody>
                {cart.map((item, i) => (
                  <TableRow key={i} hover>
                    <TableCell>{item.title}</TableCell>
                    <TableCell align="center">{item.units}</TableCell>
                    <TableCell align="right">
                      ${item.unit_price.toLocaleString()}
                    </TableCell>
                    <TableCell align="right">
                      ${(item.units * item.unit_price).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        color="error"
                        size="small"
                        disabled={loading}
                        onClick={() => removeFromCart(i)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {cart.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      align="center"
                      sx={{ py: 3, color: "text.secondary" }}
                    >
                      No hay productos en la venta
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: "center",
              gap: 2,
              pt: 1,
            }}
          >
            <Typography variant="h5" color="primary.dark" fontWeight="bold">
              Total: ${totalSale.toLocaleString()}
            </Typography>

            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                select
                label="Método de Pago"
                size="small"
                required
                value={paymentMethod}
                disabled={loading || cart.length === 0}
                onChange={(e) =>
                  setPaymentMethod(
                    e.target.value as "EFECTIVO" | "TRANSFERENCIA" | "",
                  )
                }
                error={cart.length > 0 && paymentMethod === ""}
                sx={{ minWidth: 180 }}
              >
                <MenuItem value="" disabled>
                  Seleccione...
                </MenuItem>
                <MenuItem value="EFECTIVO">Efectivo</MenuItem>
                <MenuItem value="TRANSFERENCIA">Transferencia</MenuItem>
              </TextField>

              <Button
                variant="contained"
                color="success"
                size="large"
                startIcon={
                  loading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <PointOfSale />
                  )
                }
                disabled={!canFinalize}
                onClick={onSave}
                sx={{ height: 40, fontWeight: "bold", minWidth: 160 }}
              >
                {loading ? "Procesando..." : "Finalizar"}
              </Button>
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};
