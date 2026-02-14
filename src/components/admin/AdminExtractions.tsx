import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Stack,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
} from "@mui/material";
import { MoneyOff, Person, Notes, Add, Close } from "@mui/icons-material";
import { cashService } from "../../services/cashService";
import { useNotify } from "../../hooks/useNotify";
import { useConfirm } from "../../hooks/useConfirm"; // Importamos confirm
import type { CashMovementResponse } from "../../types/cash";

export const AdminExtractions = () => {
  const { showMsg } = useNotify();
  const { confirm } = useConfirm(); // Inicializamos
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [lastExtractions, setLastExtractions] = useState<
    CashMovementResponse[]
  >([]);

  const [formData, setFormData] = useState({
    amount: "",
    reason: "",
    person: "",
    payment_method: "", // Valor por defecto
  });

  const loadExtractions = useCallback(async () => {
    try {
      const data = await cashService.getMovements();
      const extractions = data
        .filter((m) => m.type === "EXTRACCION")
        .slice(0, 10);
      setLastExtractions(extractions);
    } catch (err) {
      console.error("Error cargando historial", err);
    }
  }, []);

  useEffect(() => {
    loadExtractions();
  }, [loadExtractions]);

  const handleClose = () => {
    if (loading) return; // Evitar cierre si está cargando
    setOpenModal(false);
    setFormData({ amount: "", reason: "", person: "", payment_method: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const monto = Number(formData.amount);

    if (monto <= 0) return showMsg("El monto debe ser mayor a 0", "error");
    if (!formData.person.trim())
      return showMsg("Debe indicar un responsable", "error");

    // Diálogo de Confirmación
    const ok = await confirm({
      title: "Confirmar Extracción de Caja",
      description: `¿Retirar $${monto.toLocaleString()} de ${formData.payment_method}?`,
      confirmText: "Retirar Dinero",
      severity: "error", // Rojo porque es una salida de dinero
    });

    if (!ok) return;

    setLoading(true);
    try {
      await cashService.saveExtraction({
        amount: monto,
        reason: formData.reason,
        person: formData.person,
        payment_method: formData.payment_method, // Enviar al servicio
      });

      showMsg("Extracción registrada con éxito", "success");
      setOpenModal(false);
      setFormData({ amount: "", reason: "", person: "", payment_method: "" });
      await loadExtractions();
    } catch (err: unknown) {
      const mensaje =
        (err as { message?: string })?.message || "Error inesperado";
      showMsg(mensaje, "error");
    } finally {
      setLoading(false);
    }
  };

  const formatArgentineDate = (dateStr: string) => {
    return new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "America/Argentina/Buenos_Aires",
    }).format(new Date(dateStr));
  };

  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: "auto" }}>
      {/* Header con Botón de Acción */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Typography
          variant="h5"
          fontWeight="bold"
          color="primary"
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <MoneyOff /> Extracciones de Caja
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenModal(true)}
          color="primary"
          sx={{ borderRadius: 2 }}
        >
          Nueva Extracción
        </Button>
      </Stack>

      {/* Historial Principal */}
      <Typography variant="subtitle1" fontWeight="bold" mb={2}>
        Historial reciente de retiros
      </Typography>

      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{ borderRadius: 2 }}
      >
        <Table size="small">
          <TableHead sx={{ bgcolor: "#f8f9fa" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Fecha / Hora</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>
                Descripción / Responsable
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold" }}>
                Monto
              </TableCell>
              {/* En el TableHead */}
              <TableCell sx={{ fontWeight: "bold" }}>Método</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lastExtractions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  align="center"
                  sx={{ py: 5, color: "text.secondary" }}
                >
                  No hay extracciones registradas
                </TableCell>
              </TableRow>
            ) : (
              lastExtractions.map((m) => (
                <TableRow key={m.id} hover>
                  <TableCell sx={{ fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                    {formatArgentineDate(m.date)}
                  </TableCell>
                  <TableCell>{m.description}</TableCell>
                  <TableCell
                    align="right"
                    sx={{ color: "error.main", fontWeight: "bold" }}
                  >
                    - ${Math.abs(m.amount).toLocaleString("es-AR")}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={m.payment_method}
                      size="small"
                      variant="outlined"
                      color={
                        m.payment_method === "EFECTIVO" ? "default" : "info"
                      }
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* MODAL DE REGISTRO */}
      <Dialog
        open={openModal}
        onClose={handleClose}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            Registrar Extracción
            <IconButton onClick={handleClose} size="small" disabled={loading}>
              <Close />
            </IconButton>
          </DialogTitle>

          <DialogContent dividers>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <Typography
                variant="body2"
                fontWeight="bold"
                color="text.secondary"
              >
                Origen del dinero:
              </Typography>
              <ToggleButtonGroup
                value={formData.payment_method}
                exclusive
                onChange={(_, val) =>
                  val && setFormData({ ...formData, payment_method: val })
                }
                fullWidth
                color="primary"
                size="small"
              >
                <ToggleButton value="EFECTIVO">Efectivo</ToggleButton>
                <ToggleButton value="TRANSFERENCIA">
                  Billetera / Banco
                </ToggleButton>
              </ToggleButtonGroup>

              <TextField
                label="Monto a retirar"
                type="number"
                fullWidth
                required
                autoFocus
                disabled={loading}
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    ),
                  },
                }}
              />

              <TextField
                label="Responsable"
                fullWidth
                required
                disabled={loading}
                placeholder="¿Quién retira el dinero?"
                value={formData.person}
                onChange={(e) =>
                  setFormData({ ...formData, person: e.target.value })
                }
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <TextField
                label="Motivo"
                fullWidth
                multiline
                rows={2}
                disabled={loading}
                placeholder="Ej: Pago de flete, compra de artículos..."
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment
                        position="start"
                        sx={{ alignSelf: "flex-start", mt: 1 }}
                      >
                        <Notes fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Stack>
          </DialogContent>

          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={handleClose} color="inherit" disabled={loading}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              color="error"
              type="submit"
              disabled={loading}
              sx={{ px: 4, minWidth: 120 }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Confirmar"
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};
