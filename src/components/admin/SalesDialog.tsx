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
  setCurrentItem: (item: SaleItem) => void;
  addToCart: () => void;
  removeFromCart: (index: number) => void;
  onSave: () => void;
}

export const SaleDialog = ({
  open,
  onClose,
  articles,
  cart,
  currentItem,
  clientName,
  setClientName,
  setCurrentItem,
  addToCart,
  removeFromCart,
  onSave,
}: Props) => {
  const totalSale = cart.reduce(
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
        Registrar Venta
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <TextField
            label="Nombre del Cliente"
            fullWidth
            size="small"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Ej: Juan Pérez (Opcional)"
          />

          <Divider sx={{ my: 1 }}>Buscador de Productos</Divider>

          <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
            <Autocomplete
              sx={{ flexGrow: 1 }}
              options={articles.filter((a) => a.stock > 0)}
              getOptionLabel={(o) => `${o.title} | Stock: ${o.stock}`}
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
                  unit_price: v.final_price,
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
              sx={{ width: 80 }}
              value={currentItem.units}
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
              disabled={!currentItem.article_id}
            >
              <Add />
            </Button>
          </Stack>

          <TableContainer
            sx={{ maxHeight: 200, border: "1px solid #eee", borderRadius: 1 }}
          >
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Producto</TableCell>
                  <TableCell align="center">Cantidad</TableCell>
                  <TableCell align="right">Precio</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell width={40} />
                </TableRow>
              </TableHead>
              <TableBody>
                {cart.map((item, i) => (
                  <TableRow key={i}>
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
              pt: 1,
            }}
          >
            <Typography variant="h5" color="primary" fontWeight="bold">
              Total: ${totalSale.toLocaleString()}
            </Typography>
            <Button
              variant="contained"
              color="success"
              size="large"
              startIcon={<PointOfSale />}
              disabled={cart.length === 0}
              onClick={onSave}
            >
              Cobrar
            </Button>
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};
