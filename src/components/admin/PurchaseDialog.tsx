import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Stack,
  TextField,
  MenuItem,
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
  Paper,
} from "@mui/material";
import { Close, Add, Delete, ShoppingCartCheckout } from "@mui/icons-material";
import type { ShoppingItem } from "../../types/purchase";
import type { Article } from "../../types";
import type { Provider } from "../../types";

interface Props {
  open: boolean;
  onClose: () => void;
  providers: Provider[];
  articles: Article[];
  cart: ShoppingItem[];
  currentItem: ShoppingItem;
  providerId: string | number;
  setProviderId: (id: string | number) => void;
  paymentMethod: "EFECTIVO" | "TRANSFERENCIA" | "";
  setPaymentMethod: (method: "EFECTIVO" | "TRANSFERENCIA" | "") => void;
  setCurrentItem: (item: ShoppingItem) => void;
  addToCart: () => void;
  removeFromCart: (index: number) => void;
  onSave: () => void;
  loading?: boolean;
  purchaseDate: string;
  setPurchaseDate: (date: string) => void;
}

export const PurchaseDialog = ({
  open,
  onClose,
  providers,
  articles,
  cart,
  currentItem,
  providerId,
  setProviderId,
  paymentMethod,
  setPaymentMethod,
  setCurrentItem,
  addToCart,
  removeFromCart,
  onSave,
  loading = false,
  purchaseDate,
  setPurchaseDate,
}: Props) => {
  const totalInvoice = cart.reduce(
    (acc, item) => acc + item.units * item.unit_price,
    0,
  );

  // Validación consistente: requiere items, proveedor y método de pago
  const canFinalize =
    cart.length > 0 && providerId !== "" && paymentMethod !== "" && !loading;

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
          bgcolor: "primary.main",
          color: "white",
          mb: 1,
          fontWeight: "bold",
        }}
      >
        Registrar Nueva Compra
        <IconButton
          onClick={onClose}
          disabled={loading}
          sx={{ color: "white" }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {/* Fila: Proveedor y Fecha de la Compra */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              select
              label="Proveedor"
              fullWidth
              size="small"
              value={providerId}
              disabled={loading}
              required
              error={cart.length > 0 && providerId === ""}
              onChange={(e) => setProviderId(e.target.value)}
              sx={{ flexGrow: 2 }} // El proveedor toma más espacio
            >
              <MenuItem value="" disabled>
                Seleccione un proveedor...
              </MenuItem>
              {providers.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Fecha de Compra"
              type="date"
              size="small"
              fullWidth
              value={purchaseDate} // Debes pasar este estado por props
              onChange={(e) => setPurchaseDate(e.target.value)} // Y su setter
              disabled={loading}
              InputLabelProps={{
                shrink: true, // Esto hace que el label no se encime con el formato de fecha
              }}
            />
          </Stack>

          <Divider sx={{ fontWeight: "bold" }}>
            Agregar Artículos al Remito
          </Divider>

          {/* Formulario de entrada de artículos */}
          <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
            <Autocomplete
              sx={{ flexGrow: 1 }}
              options={articles}
              disabled={loading}
              getOptionLabel={(o) => `${o.title} (Actual: ${o.stock})`}
              size="small"
              value={
                articles.find((a) => a.id === currentItem.article_id) || null
              }
              onChange={(_, v) =>
                v &&
                setCurrentItem({
                  ...currentItem,
                  article_id: v.id,
                  title: v.title,
                  unit_price: v.unit_price || 0,
                  profit_margin: v.profit_margin || 0,
                  final_price: v.final_price || 0,
                })
              }
              renderInput={(params) => (
                <TextField {...params} label="Seleccionar Artículo" />
              )}
            />
            <TextField
              label="Cant"
              type="number"
              size="small"
              disabled={loading}
              sx={{ width: { md: 90 } }}
              value={currentItem.units}
              onChange={(e) =>
                setCurrentItem({
                  ...currentItem,
                  units: Math.max(1, Number(e.target.value)),
                })
              }
            />
            <TextField
              label="Costo Unit."
              type="number"
              size="small"
              disabled={loading}
              sx={{ width: { md: 130 } }}
              value={currentItem.unit_price || ""}
              onChange={(e) =>
                setCurrentItem({
                  ...currentItem,
                  unit_price: Number(e.target.value),
                })
              }
            />
            <Button
              variant="contained"
              color="secondary"
              onClick={addToCart}
              disabled={loading || !currentItem.article_id}
            >
              <Add />
            </Button>
          </Stack>

          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{ maxHeight: 300, borderRadius: 1, bgcolor: "#fafafa" }}
          >
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ bgcolor: "#eee", fontWeight: "bold" }}>
                    Artículo
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ bgcolor: "#eee", fontWeight: "bold" }}
                  >
                    Cantidad
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ bgcolor: "#eee", fontWeight: "bold" }}
                  >
                    Costo
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ bgcolor: "#eee", fontWeight: "bold" }}
                  >
                    Subtotal
                  </TableCell>
                  <TableCell width={50} sx={{ bgcolor: "#eee" }} />
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
                      No hay artículos cargados en la compra
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* SECCIÓN INFERIOR: TOTAL, MÉTODO Y BOTÓN */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              justifyContent: "space-between",
              alignItems: "center",
              gap: 2,
              pt: 2,
              borderTop: "1px solid #eee",
            }}
          >
            <Typography variant="h5" fontWeight="bold" color="primary.dark">
              Total: ${totalInvoice.toLocaleString()}
            </Typography>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              alignItems="center"
            >
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
                sx={{ minWidth: 200 }}
              >
                <MenuItem value="" disabled>
                  Seleccione método...
                </MenuItem>
                <MenuItem value="EFECTIVO">EFECTIVO</MenuItem>
                <MenuItem value="TRANSFERENCIA">TRANSFERENCIA</MenuItem>
              </TextField>

              <Button
                variant="contained"
                color="success"
                size="large"
                startIcon={
                  loading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <ShoppingCartCheckout />
                  )
                }
                disabled={!canFinalize}
                onClick={onSave}
                sx={{ height: 40, fontWeight: "bold", minWidth: 200 }}
              >
                {loading ? "Procesando..." : "Finalizar Compra"}
              </Button>
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};
