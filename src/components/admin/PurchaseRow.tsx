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
  Receipt,
} from "@mui/icons-material";
import type { PurchaseResponse } from "../../types/purchase";

export const PurchaseRow = ({ purchase }: { purchase: PurchaseResponse }) => {
  const [open, setOpen] = useState(false);

  // Función de normalización de fecha para Argentina (UTC-3)
  const formatToArgentina = (dateInput: string) => {
    let date = new Date(dateInput);

    // Si el string no tiene indicador de zona, asumimos que viene del servidor en UTC
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

        {/* Celda de Fecha con hora de Argentina */}
        <TableCell>{formatToArgentina(purchase.date)}</TableCell>

        <TableCell>{purchase.provider_name}</TableCell>
        <TableCell align="right">
          <Typography fontWeight="bold" color="success.main">
            ${(purchase.total ?? 0).toLocaleString()}
          </Typography>
        </TableCell>
      </TableRow>

      <TableRow sx={{ bgcolor: open ? "rgba(233, 229, 15, 0.62)" : "inherit" }}>
        <TableCell sx={{ py: 0 }} colSpan={4}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box
              sx={{
                m: { xs: 1, sm: 2 },
                bgcolor: "#fff",
                p: 2,
                borderRadius: 1,
                border: "1px solid #e0e0e0",
                boxShadow: 1,
              }}
            >
              <Typography
                variant="subtitle2"
                mb={1}
                display="flex"
                alignItems="center"
                gap={1}
                color="primary.main"
              >
                <Receipt fontSize="small" /> Detalle de la Factura
              </Typography>

              <Box sx={{ overflowX: "auto" }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        Artículo
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: "bold" }}>
                        Cantidad
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: "bold" }}>
                        Precio Unitario
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: "bold" }}>
                        Subtotal
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {purchase.details.map((d) => (
                      <TableRow key={d.id}>
                        <TableCell>{d.article_title}</TableCell>
                        <TableCell align="center">{d.units}</TableCell>
                        <TableCell align="center">
                          ${(d.unit_price ?? 0).toLocaleString()}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: "600" }}>
                          $
                          {(
                            (d.units || 0) * (d.unit_price || 0)
                          ).toLocaleString()}
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
