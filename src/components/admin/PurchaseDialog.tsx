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
  providerId: string;
  setProviderId: (id: string) => void;
  setCurrentItem: (item: ShoppingItem) => void;
  addToCart: () => void;
  removeFromCart: (index: number) => void;
  onSave: () => void;
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
  setCurrentItem,
  addToCart,
  removeFromCart,
  onSave,
}: Props) => {
  const totalInvoice = cart.reduce(
    (acc, item) => acc + item.units * item.unit_price,
    0,
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        Registrar Nueva Compra
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <TextField
            select
            label="Proveedor"
            fullWidth
            size="small"
            value={providerId}
            onChange={(e) => setProviderId(e.target.value)}
          >
            {providers.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.name}
              </MenuItem>
            ))}
          </TextField>

          <Divider>Agregar Artículos</Divider>

          <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
            <Autocomplete
              sx={{ flexGrow: 1 }}
              options={articles}
              getOptionLabel={(o) => o.title}
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
                  unit_price: v.unit_price,
                  profit_margin: v.profit_margin,
                  final_price: v.final_price,
                })
              }
              renderInput={(params) => (
                <TextField {...params} label="Artículo" />
              )}
            />
            <TextField
              label="Cant"
              type="number"
              size="small"
              sx={{ width: 80 }}
              value={currentItem.units}
              onChange={(e) =>
                setCurrentItem({
                  ...currentItem,
                  units: Number(e.target.value),
                })
              }
            />
            <TextField
              label="Costo"
              type="number"
              size="small"
              sx={{ width: 100 }}
              value={currentItem.unit_price || ""}
              onChange={(e) =>
                setCurrentItem({
                  ...currentItem,
                  unit_price: Number(e.target.value),
                })
              }
            />
            <Button variant="contained" color="secondary" onClick={addToCart}>
              <Add />
            </Button>
          </Stack>

          <TableContainer
            sx={{ maxHeight: 250, border: "1px solid #eee", borderRadius: 1 }}
          >
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Artículo</TableCell>
                  <TableCell align="right">Subtotal</TableCell>
                  <TableCell width={50} />
                </TableRow>
              </TableHead>
              <TableBody>
                {cart.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      {item.title} (x{item.units})
                    </TableCell>
                    <TableCell align="right">
                      ${(item.units * item.unit_price).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => removeFromCart(i)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mt: 1,
            }}
          >
            <Typography variant="h6">
              Total: ${totalInvoice.toLocaleString()}
            </Typography>
            <Button
              variant="contained"
              color="success"
              startIcon={<ShoppingCartCheckout />}
              disabled={cart.length === 0 || !providerId}
              onClick={onSave}
            >
              Finalizar
            </Button>
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};
