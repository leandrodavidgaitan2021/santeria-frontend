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
  Chip,
  Tooltip,
} from "@mui/material";
import {
  KeyboardArrowUp,
  KeyboardArrowDown,
  ReceiptLong,
  Payments,
  AccountBalance,
  Print, // Ícono para el ticket
} from "@mui/icons-material";
import type { SaleResponse } from "../../types/sales";
import { generateSaleTicket } from "../../utils/ticketGenerator"; // Asegúrate de tener esta utilidad

export const SaleRow = ({ sale }: { sale: SaleResponse }) => {
  const [open, setOpen] = useState(false);

  // Función para formatear la fecha forzando Argentina (UTC-3)
  const formatToArgentina = (dateInput: string) => {
    let date = new Date(dateInput);
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

  // Manejador para generar el ticket desde el historial
  const handlePrintTicket = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evita que se abra el desplegable al hacer click en el ícono

    // Adaptamos los datos del historial al formato que espera el generador
    const ticketData = {
      clientName: sale.client_name || "Consumidor Final",
      paymentMethod: sale.payment_method || "EFECTIVO",
      total: sale.total || 0,
      items: sale.details.map((d) => ({
        article_id: d.id,
        title: d.article_title,
        units: d.units,
        unit_price: d.unit_price,
      })),
    };

    generateSaleTicket(ticketData);
  };

  return (
    <>
      <TableRow
        sx={{
          bgcolor: open ? "rgba(233, 229, 15, 0.2)" : "inherit",
          transition: "background-color 0.3s ease",
          "& > *": { borderBottom: "unset" },
        }}
      >
        <TableCell width={50}>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>

        <TableCell>{formatToArgentina(sale.date)}</TableCell>

        <TableCell>{sale.client_name || "Consumidor Final"}</TableCell>

        <TableCell>
          <Chip
            size="small"
            icon={
              sale.payment_method === "EFECTIVO" ? (
                <Payments fontSize="small" />
              ) : (
                <AccountBalance fontSize="small" />
              )
            }
            label={sale.payment_method || "EFECTIVO"}
            color={sale.payment_method === "TRANSFERENCIA" ? "info" : "success"}
            variant="outlined"
            sx={{ fontWeight: "500", fontSize: "0.75rem" }}
          />
        </TableCell>

        <TableCell>
          <Typography variant="body2" color="text.secondary">
            {sale.seller_name}
          </Typography>
        </TableCell>

        {/* 5. Columna de Total */}
        <TableCell align="center">
          <Typography fontWeight="bold" color="primary.main">
            ${(sale.total ?? 0).toLocaleString()}
          </Typography>
        </TableCell>

        {/* 6. Columna de Acción (PDF) */}
        <TableCell align="center">
          <Tooltip title="Reimprimir Ticket">
            <IconButton
              size="small"
              color="secondary"
              onClick={handlePrintTicket}
            >
              <Print fontSize="small" />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>

      {/* Fila Desplegable */}
      <TableRow sx={{ bgcolor: open ? "rgba(233, 229, 15, 0.1)" : "inherit" }}>
        <TableCell sx={{ py: 0 }} colSpan={7}>
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
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  color: "text.primary",
                }}
              >
                <ReceiptLong fontSize="small" /> Resumen de Artículos Vendidos
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>Artículo</TableCell>
                    <TableCell align="center" sx={{ fontWeight: "bold" }}>
                      Cantidad
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: "bold" }}>
                      Precio Unit.
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: "bold" }}>
                      Subtotal
                    </TableCell>
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
                      <TableCell align="right" sx={{ fontWeight: "600" }}>
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
