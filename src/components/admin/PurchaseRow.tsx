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
} from "@mui/material";
import {
  KeyboardArrowUp,
  KeyboardArrowDown,
  Receipt,
  Payments,
  AccountBalance,
} from "@mui/icons-material";
import type { PurchaseResponse } from "../../types/purchase";

export const PurchaseRow = ({ purchase }: { purchase: PurchaseResponse }) => {
  const [open, setOpen] = useState(false);

  // Función de normalización de fecha para Argentina (UTC-3)
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

  return (
    <>
      <TableRow
        sx={{
          bgcolor: open ? "rgba(25, 118, 210, 0.08)" : "inherit", // Color azul tenue al abrir
          transition: "background-color 0.3s ease",
          "& > *": { borderBottom: "unset" },
        }}
      >
        <TableCell width={50}>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>

        <TableCell>{formatToArgentina(purchase.date)}</TableCell>

        <TableCell sx={{ fontWeight: "medium" }}>
          {purchase.provider_name}
        </TableCell>

        {/* Chip dinámico según el método de pago */}
        <TableCell>
          <Chip
            size="small"
            icon={
              purchase.payment_method === "EFECTIVO" ? (
                <Payments />
              ) : (
                <AccountBalance />
              )
            }
            label={purchase.payment_method}
            color={purchase.payment_method === "EFECTIVO" ? "success" : "info"}
            variant="outlined"
            sx={{ fontWeight: "bold", fontSize: "0.75rem" }}
          />
        </TableCell>

        <TableCell align="right">
          <Typography fontWeight="bold" color="error.main">
            {/* Usamos error.main (rojo) porque en compras es una salida de dinero */}
            - ${(purchase.total ?? 0).toLocaleString()}
          </Typography>
        </TableCell>
      </TableRow>

      <TableRow sx={{ bgcolor: open ? "rgba(25, 118, 210, 0.04)" : "inherit" }}>
        <TableCell sx={{ py: 0 }} colSpan={5}>
          {" "}
          {/* Colspan corregido a 5 */}
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box
              sx={{
                m: { xs: 1, sm: 2 },
                bgcolor: "#fff",
                p: 2,
                borderRadius: 2,
                border: "1px solid #e0e0e0",
                boxShadow: 2,
              }}
            >
              <Typography
                variant="subtitle2"
                mb={2}
                display="flex"
                alignItems="center"
                gap={1}
                color="primary.main"
                fontWeight="bold"
              >
                <Receipt fontSize="small" /> DETALLE DE COMPRA #{purchase.id}
              </Typography>

              <Box sx={{ overflowX: "auto" }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#fafafa" }}>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        Artículo
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: "bold" }}>
                        Cantidad
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: "bold" }}>
                        Costo Unitario
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: "bold" }}>
                        Subtotal
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {purchase.details.map((d) => (
                      <TableRow key={d.id} hover>
                        <TableCell>{d.article_title}</TableCell>
                        <TableCell align="center">{d.units}</TableCell>
                        <TableCell align="center">
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
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};
