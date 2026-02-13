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
  Stack,
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
  EventNote, // Icono para el año
} from "@mui/icons-material";
import { cashService } from "../../services/cashService";
import type { CashMovementResponse } from "../../types/cash";

export const AdminStatistics = () => {
  const [movements, setMovements] = useState<CashMovementResponse[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [filter, setFilter] = useState("total");
  const [loading, setLoading] = useState(false);

  const isMounted = useRef(false);

  /**
   * Carga de datos con soporte para filtros temporales y TOTAL
   */
  const fetchData = useCallback(async (filterType: string) => {
    setLoading(true);
    try {
      const now = new Date();
      let fromDate = "";

      if (filterType === "today") {
        fromDate = now.toISOString().split("T")[0];
      } else if (filterType === "week") {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        fromDate = weekAgo.toISOString().split("T")[0];
      } else if (filterType === "month") {
        fromDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
      } else if (filterType === "year") {
        // Filtro Anual: desde el 1 de enero del año actual
        fromDate = `${now.getFullYear()}-01-01`;
      }
      // Si es "total", fromDate queda como "" para traer todo el historial

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

  const ingresos = movements
    .filter((m) => m.amount > 0)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const egresos = movements
    .filter((m) => m.amount < 0)
    .reduce((acc, curr) => acc + Math.abs(curr.amount), 0);

  const formatCurrency = (val: number) => `$${val.toLocaleString("es-AR")}`;

  const getPeriodText = () => {
    switch (filter) {
      case "today":
        return "de Hoy";
      case "week":
        return "de la Semana";
      case "month":
        return "del Mes";
      case "year":
        return "del Año";
      default:
        return "Históricos (Total)";
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* HEADER Y FILTROS */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems="center"
        mb={4}
        spacing={2}
      >
        <Typography variant="h4" fontWeight="bold">
          Estadísticas
        </Typography>

        <Stack direction="row" alignItems="center" spacing={2}>
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
        </Stack>
      </Stack>

      {/* TARJETAS DE RESUMEN */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 5 }}>
        {/* SALDO REAL ACTUAL */}
      {/* SALDO REAL ACTUAL (Versión Compacta) */}
        <Paper
          elevation={4}
          sx={{
            py: 2, // Reducimos padding vertical (antes era p: 4)
            px: 3,
            flex: "1 1 100%",
            bgcolor: "primary.dark",
            color: "white",
            borderRadius: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            borderBottom: "4px solid #1565c0", // Línea un poco más delgada
          }}
        >
          <AccountBalance sx={{ mb: 0.5, opacity: 0.8, fontSize: 24 }} /> {/* Icono más chico */}
          <Typography
            sx={{ 
              opacity: 0.8, 
              textTransform: "uppercase", 
              fontSize: "0.65rem", // Texto más pequeño
              letterSpacing: 0.5 
            }}
            variant="caption"
            fontWeight="bold"
          >
            Efectivo Real Disponible en Caja
          </Typography>
          <Typography 
            variant="h4" // Bajamos de h2 a h4 para ganar mucho espacio vertical
            fontWeight="bold"
            sx={{ mt: 0.5 }}
          >
            {formatCurrency(balance)}
          </Typography>
        </Paper>

        {/* TARJETAS DINÁMICAS */}
        <Paper
          elevation={2}
          sx={{
            p: 3,
            flex: "1 1 250px",
            borderLeft: "6px solid #2e7d32",
            borderRadius: 2,
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" mb={1}>
            <TrendingUp color="success" fontSize="small" />
            <Typography
              color="textSecondary"
              variant="body2"
              fontWeight="medium"
            >
              Ingresos {getPeriodText()}
            </Typography>
          </Stack>
          <Typography variant="h5" fontWeight="bold" color="success.main">
            {formatCurrency(ingresos)}
          </Typography>
        </Paper>

        <Paper
          elevation={2}
          sx={{
            p: 3,
            flex: "1 1 250px",
            borderLeft: "6px solid #d32f2f",
            borderRadius: 2,
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" mb={1}>
            <TrendingDown color="error" fontSize="small" />
            <Typography
              color="textSecondary"
              variant="body2"
              fontWeight="medium"
            >
              Egresos {getPeriodText()}
            </Typography>
          </Stack>
          <Typography variant="h5" fontWeight="bold" color="error.main">
            {formatCurrency(egresos)}
          </Typography>
        </Paper>

        <Paper
          elevation={2}
          sx={{
            p: 3,
            flex: "1 1 250px",
            borderLeft: "6px solid #0288d1",
            borderRadius: 2,
          }}
        >
          <Typography
            color="textSecondary"
            variant="body2"
            fontWeight="medium"
            mb={1}
          >
            Balance Neto {getPeriodText()}
          </Typography>
          <Typography variant="h5" fontWeight="bold" color="info.main">
            {ingresos - egresos >= 0 ? "+" : ""}
            {formatCurrency(ingresos - egresos)}
          </Typography>
        </Paper>
      </Box>

      {/* TABLA */}
      <Typography
        variant="h6"
        fontWeight="bold"
        mb={2}
        sx={{ display: "flex", alignItems: "center", gap: 1 }}
      >
        <History /> Movimientos {getPeriodText()}
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
                  {new Date(m.date).toLocaleDateString("es-AR")}{" "}
                  {new Date(m.date).toLocaleTimeString("es-AR", {
                    hour: "2-digit",
                    minute: "2-digit",
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
  );
};
