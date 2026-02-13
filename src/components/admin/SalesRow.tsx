import { useState } from "react";
import {
  TableRow,
  TableCell,
  IconButton,
  Collapse,
  Box,
  Typography,
  Table,
  TableHead,
  TableBody,
} from "@mui/material";
import {
  KeyboardArrowUp,
  KeyboardArrowDown,
  ReceiptLong,
} from "@mui/icons-material";
import type { SaleResponse } from "../../types/sales";

export const SaleRow = ({ sale }: { sale: SaleResponse }) => {
  const [open, setOpen] = useState(false);

  // Función para formatear la fecha forzando Argentina (UTC-3)
  const formatToArgentina = (dateInput: string) => {
    let date = new Date(dateInput);

    // Si el string no trae 'Z' ni el offset '-03:00', asumimos que el server lo mandó en UTC puro
    if (!dateInput.includes("Z") && !dateInput.includes("-03:00")) {
      date = new Date(dateInput + "Z");
    }

    return new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "America/Argentina/Buenos_Aires",
    }).format(date);
  };

  return (
    <>
      <TableRow
        sx={{
          bgcolor: open ? "rgba(233, 229, 15, 0.62)" : "inherit", // Bajé un poco la opacidad para que sea más legible
          transition: "background-color 0.3s ease",
          "& > *": { borderBottom: "unset" },
        }}
      >
        <TableCell width={50}>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>

        {/* Celda de Fecha Formateada */}
        <TableCell>{formatToArgentina(sale.date)}</TableCell>

        <TableCell>{sale.client_name || "Consumidor Final"}</TableCell>

        {/* Mostrar el Vendedor */}
        <TableCell>
          <Typography variant="body2" color="text.secondary">
            {sale.seller_name}
          </Typography>
        </TableCell>

        <TableCell align="right">
          <Typography fontWeight="bold" color="primary.main">
            ${(sale.total ?? 0).toLocaleString()}
          </Typography>
        </TableCell>
      </TableRow>

      <TableRow sx={{ bgcolor: open ? "rgba(233, 229, 15, 0.62)" : "inherit" }}>
        <TableCell sx={{ py: 0 }} colSpan={5}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box
              sx={{
                m: 2,
                bgcolor: "#f4f7f6",
                p: 2,
                borderRadius: 1,
                border: "1px solid #e0e0e0",
              }}
            >
              <Typography
                variant="subtitle2"
                mb={1}
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <ReceiptLong fontSize="small" /> Resumen de Artículos Vendidos
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Artículo</TableCell>
                    <TableCell align="center">Cantidad</TableCell>
                    <TableCell align="right">Precio Unit.</TableCell>
                    <TableCell align="right">Subtotal</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sale.details.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell>{d.article_title}</TableCell>
                      <TableCell align="center">{d.units}</TableCell>
                      <TableCell align="right">
                        ${(d.unit_price ?? 0).toLocaleString()}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: "500" }}>
                        ${(d.units * d.unit_price).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};
