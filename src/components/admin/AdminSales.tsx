import { useEffect, useState, useMemo, useContext } from "react";
import { AuthContext } from "../../context/AuthContext"; // Importa tu contexto
import {
  Box,
  Paper,
  TextField,
  Button,
  Stack,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputAdornment,
} from "@mui/material";
import { Add, Search } from "@mui/icons-material";
import { useArticles } from "../../hooks/useArticles";
import { useNotify } from "../../hooks/useNotify";
import { saleService } from "../../services/saleService"; // Debes crear este service
import type { SaleResponse, SaleItem } from "../../types/sales";
import { SaleDialog } from "./SalesDialog";
import { SaleRow } from "./SalesRow";

export const AdminSales = () => {
  const { user, isAdmin } = useContext(AuthContext); // Obtenemos el usuario y el rol
  const { articles, fetchArticles } = useArticles();
  const { showMsg } = useNotify();

  const [sales, setSales] = useState<SaleResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [openModal, setOpenModal] = useState(false);

  // Estado del Formulario
  const [clientName, setClientName] = useState("");
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [currentItem, setCurrentItem] = useState<SaleItem>({
    article_id: 0,
    title: "",
    units: 1,
    unit_price: 0,
  });

  const loadHistory = async () => {
    try {
      const data = await saleService.getAll();
      setSales(data);
    } catch (err: unknown) {
      const error = err as { message?: string };
      showMsg(error.message || "Error al guardar", "error");
    }
  };

  useEffect(() => {
    // Definimos una bandera para evitar fugas de memoria si el componente se desmonta

    let isMounted = true;

    const fetchData = async () => {
      try {
        const data = await saleService.getAll();

        if (isMounted) {
          setSales(data);
        }
      } catch (err: unknown) {
        const error = err as { message?: string };

        if (isMounted) {
          showMsg(error.message || "Error al guardar", "error");
        }
      }
    };

    fetchData();

    // Función de limpieza

    return () => {
      isMounted = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredSales = useMemo(() => {
    // 1. Verificamos si user existe antes de hacer nada
    if (!user) {
      console.log("Cargando usuario...");
      return [];
    }

    // Ahora TypeScript sabe que 'user' NO es null aquí abajo
    console.log("ID del usuario para filtrar:", user.id);

    // 2. Aplicamos el filtro de rol
    const baseSales = isAdmin
      ? sales
      : sales.filter((s) => Number(s.user_id) === Number(user.id));

    // 3. Aplicamos la búsqueda
    return baseSales.filter((s) => {
      const search = searchTerm.toLowerCase();
      const clientMatch = s.client_name?.toLowerCase().includes(search);
      const dateMatch = new Date(s.date).toLocaleDateString().includes(search);

      return clientMatch || dateMatch;
    });
  }, [sales, searchTerm, isAdmin, user]);

  const handleConfirmSale = async () => {
    try {
      await saleService.saveSale({ client_name: clientName, items: cart });
      showMsg("Venta realizada con éxito");
      setOpenModal(false);
      setCart([]);
      setClientName("");
      fetchArticles(); // Actualiza el stock en el listado
      loadHistory();
    } catch (err: unknown) {
      const error = err as { message?: string };
      showMsg(error.message || "Error al guardar", "error");
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" fontWeight="bold" color="primary" mb={3}>
        Punto de Venta
      </Typography>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        mb={3}
        justifyContent="space-between"
      >
        <TextField
          placeholder="Buscar venta (cliente o fecha)..."
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => setOpenModal(true)}
        >
          Nueva Venta
        </Button>
      </Stack>

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: "#f5f5f5" }}>
            <TableRow>
              <TableCell width={50} />
              <TableCell>Fecha-Hora</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Vendedor</TableCell> {/* <-- Encabezado nuevo */}
              <TableCell align="right">Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSales.map((s) => (
              <SaleRow key={s.id} sale={s} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <SaleDialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        articles={articles}
        cart={cart}
        currentItem={currentItem}
        clientName={clientName}
        setClientName={setClientName}
        setCurrentItem={setCurrentItem}
        addToCart={() => {
          setCart([...cart, currentItem]);
          setCurrentItem({ article_id: 0, title: "", units: 1, unit_price: 0 });
        }}
        removeFromCart={(idx) => setCart(cart.filter((_, i) => i !== idx))}
        onSave={handleConfirmSale}
      />
    </Box>
  );
};
