import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "../components/ProtectedRoute";
import Login from "../pages/Login";
//import { Store } from "../pages/Store";
import { AdminDashboard } from "../pages/AdminDashboard";

export const AppRouter = () => {
  return (
    <Routes>
      {/* Rutas Públicas 
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Store />} />
      */}
      <Route path="/" element={<Login />} />

      {/* Rutas Administrativas (Solo Admin y Vendedor) */}
      <Route element={<ProtectedRoute allowedRoles={["admin", "vendedor"]} />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        {/* Aquí podrías agregar /admin/inventario */}
      </Route>

      {/* Redirección automática */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
