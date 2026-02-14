import { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
} from "@mui/material";
import {
  CalendarToday,
  DateRange,
  CalendarMonth,
  AllInclusive,
  AccountBalance,
  TrendingUp,
  TrendingDown,
  History,
  EventNote,
  Payments,
} from "@mui/icons-material";
import { cashService } from "../../services/cashService";
import type { CashMovementResponse } from "../../types/cash";

export const AdminStatistics = () => {
  const [movements, setMovements] = useState<CashMovementResponse[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [filter, setFilter] = useState("total");
  const [loading, setLoading] = useState(false);

  const isMounted = useRef(false);

  const fetchData = useCallback(async (filterType: string) => {
    setLoading(true);
    try {
      const now = new Date();
      let fromDate = "";

      if (filterType === "today") {
        fromDate = new Intl.DateTimeFormat("fr-CA", {
          // fr-CA devuelve YYYY-MM-DD
          timeZone: "America/Argentina/Buenos_Aires",
        }).format(now);
      } else if (filterType === "week") {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        fromDate = weekAgo.toISOString().split("T")[0];
      } else if (filterType === "month") {
        fromDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
      } else if (filterType === "year") {
        fromDate = `${now.getFullYear()}-01-01`;
      }

      const [movementsData, balanceData] = await Promise.all([
        cashService.getMovements(fromDate),
        cashService.getBalance(),
      ]);

      setMovements(movementsData);
      setBalance(balanceData.balance);
    } catch (error) {
      console.error("Error al cargar estadísticas", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isMounted.current) {
      fetchData("total");
      isMounted.current = true;
    }
  }, [fetchData]);

  const handleFilterChange = async (
    _: React.MouseEvent<HTMLElement>,
    nextFilter: string | null,
  ) => {
    if (nextFilter !== null && nextFilter !== filter) {
      setFilter(nextFilter);
      await fetchData(nextFilter);
    }
  };

  // --- CÁLCULOS FILTRADOS POR MÉTODO ---
  const efectivoDisp = movements
    .filter((m) => m.payment_method === "EFECTIVO")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const transferenciaDisp = movements
    .filter((m) => m.payment_method === "TRANSFERENCIA")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const ingresos = movements
    .filter((m) => m.amount > 0)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const egresos = movements
    .filter((m) => m.amount < 0)
    .reduce((acc, curr) => acc + Math.abs(curr.amount), 0);

  const formatCurrency = (val: number) => `$${val.toLocaleString("es-AR")}`;

  return (
    <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 3 }}>
      {/* HEADER Y FILTROS */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography variant="h4" fontWeight="bold">
          Estadísticas
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {loading && <CircularProgress size={20} />}
          <ToggleButtonGroup
            value={filter}
            exclusive
            onChange={handleFilterChange}
            color="primary"
            size="small"
          >
            <ToggleButton value="total">
              <AllInclusive sx={{ mr: 1, fontSize: 18 }} /> Total
            </ToggleButton>
            <ToggleButton value="year">
              <EventNote sx={{ mr: 1, fontSize: 18 }} /> Año
            </ToggleButton>
            <ToggleButton value="month">
              <CalendarMonth sx={{ mr: 1, fontSize: 18 }} /> Mes
            </ToggleButton>
            <ToggleButton value="week">
              <DateRange sx={{ mr: 1, fontSize: 18 }} /> Semana
            </ToggleButton>
            <ToggleButton value="today">
              <CalendarToday sx={{ mr: 1, fontSize: 18 }} /> Día
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {/* CONTENEDOR DE SALDOS (FLEXBOX) */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
        {/* Saldo Total */}
        <Paper
          elevation={4}
          sx={{
            p: 2,
            flex: "1 1 100%",
            bgcolor: "primary.dark",
            color: "white",
            borderRadius: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            borderBottom: "4px solid #1565c0",
          }}
        >
          <AccountBalance sx={{ mb: 0.5, opacity: 0.8, fontSize: 24 }} />
          <Typography
            variant="caption"
            sx={{
              opacity: 0.8,
              textTransform: "uppercase",
              fontSize: "0.65rem",
              fontWeight: "bold",
            }}
          >
            Saldo Neto Total (Caja + Banco)
          </Typography>
          <Typography variant="h4" fontWeight="bold">
            {formatCurrency(balance)}
          </Typography>
        </Paper>

        {/* Efectivo */}
        <Paper
          elevation={2}
          sx={{
            p: 2,
            flex: "1 1 280px",
            borderRadius: 3,
            borderLeft: "6px solid #2e7d32",
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Payments color="success" fontSize="large" />
          <Box>
            <Typography
              variant="caption"
              color="textSecondary"
              fontWeight="bold"
            >
              EFECTIVO EN MANO
            </Typography>
            <Typography variant="h5" fontWeight="bold" color="success.main">
              {formatCurrency(efectivoDisp)}
            </Typography>
          </Box>
        </Paper>

        {/* Transferencia */}
        <Paper
          elevation={2}
          sx={{
            p: 2,
            flex: "1 1 280px",
            borderRadius: 3,
            borderLeft: "6px solid #0288d1",
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <AccountBalance color="info" fontSize="large" />
          <Box>
            <Typography
              variant="caption"
              color="textSecondary"
              fontWeight="bold"
            >
              BANCO / VIRTUAL
            </Typography>
            <Typography variant="h5" fontWeight="bold" color="info.main">
              {formatCurrency(transferenciaDisp)}
            </Typography>
          </Box>
        </Paper>
      </Box>

      {/* MÉTRICAS DE RENDIMIENTO (FLEXBOX) */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
        <Paper
          sx={{
            p: 2,
            flex: "1 1 200px",
            borderRadius: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography variant="caption" color="textSecondary">
              INGRESOS (+)
            </Typography>
            <Typography variant="h6" color="success.main" fontWeight="bold">
              {formatCurrency(ingresos)}
            </Typography>
          </Box>
          <TrendingUp color="success" />
        </Paper>
        <Paper
          sx={{
            p: 2,
            flex: "1 1 200px",
            borderRadius: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography variant="caption" color="textSecondary">
              EGRESOS (-)
            </Typography>
            <Typography variant="h6" color="error.main" fontWeight="bold">
              {formatCurrency(egresos)}
            </Typography>
          </Box>
          <TrendingDown color="error" />
        </Paper>
      </Box>

      {/* TABLA DE MOVIMIENTOS */}
      <Box>
        <Typography
          variant="h6"
          fontWeight="bold"
          mb={2}
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <History /> Últimos Movimientos
        </Typography>
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{ borderRadius: 2 }}
        >
          <Table size="small">
            <TableHead sx={{ bgcolor: "#f8f9fa" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Fecha</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Tipo</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Método</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Descripción</TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold" }}>
                  Monto
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {movements.map((m) => (
                <TableRow key={m.id} hover>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    {new Date(m.date).toLocaleDateString("es-AR", {
                      timeZone: "America/Argentina/Buenos_Aires",
                    })}{" "}
                    {new Date(m.date).toLocaleTimeString("es-AR", {
                      timeZone: "America/Argentina/Buenos_Aires",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false, // <-- Esto quita el AM/PM y fuerza 24hs
                    })}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={m.type}
                      size="small"
                      color={m.amount >= 0 ? "success" : "error"}
                      variant="outlined"
                      sx={{ fontWeight: "bold" }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={m.payment_method}
                      size="small"
                      // Cambiamos "tonal" por "outlined" o "filled"
                      variant={
                        m.payment_method === "EFECTIVO" ? "outlined" : "filled"
                      }
                      color={
                        m.payment_method === "EFECTIVO" ? "default" : "info"
                      }
                      sx={{ fontSize: "0.7rem", fontWeight: "bold" }}
                    />
                  </TableCell>
                  <TableCell>{m.description}</TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      fontWeight: "bold",
                      color: m.amount >= 0 ? "success.main" : "error.main",
                    }}
                  >
                    {m.amount >= 0 ? "+" : "-"}{" "}
                    {formatCurrency(Math.abs(m.amount))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};
