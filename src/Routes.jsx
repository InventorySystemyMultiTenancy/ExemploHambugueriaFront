import { Navigate, Route, Routes } from "react-router-dom";
import PrivateRoute from "./routes/PrivateRoute.jsx";

import HomePage from "./pages/HomePage.jsx";
import CardapioPage from "./pages/CardapioPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import ClientDashboardPage from "./pages/ClientDashboardPage.jsx";
import KitchenPage from "./pages/KitchenPage.jsx";
import AdminPanelPage from "./pages/AdminPanelPage.jsx";
import AdminProductsPage from "./pages/AdminProductsPage.jsx";
import AdminOrderHistoryPage from "./pages/AdminOrderHistoryPage.jsx";
import MotoboyPage from "./pages/MotoboyPage.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<HomePage />} />
      <Route path="/cardapio" element={<CardapioPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Cliente */}
      <Route
        path="/checkout"
        element={
          <PrivateRoute allowedRoles={["CLIENTE", "ADMIN", "FUNCIONARIO"]}>
            <CheckoutPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute allowedRoles={["CLIENTE"]}>
            <ClientDashboardPage />
          </PrivateRoute>
        }
      />

      {/* Cozinha */}
      <Route
        path="/cozinha"
        element={
          <PrivateRoute allowedRoles={["COZINHA", "ADMIN", "FUNCIONARIO"]}>
            <KitchenPage />
          </PrivateRoute>
        }
      />

      {/* Admin */}
      <Route
        path="/admin"
        element={
          <PrivateRoute allowedRoles={["ADMIN", "FUNCIONARIO"]}>
            <AdminPanelPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/produtos"
        element={
          <PrivateRoute allowedRoles={["ADMIN", "FUNCIONARIO"]}>
            <AdminProductsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/historico"
        element={
          <PrivateRoute allowedRoles={["ADMIN", "FUNCIONARIO"]}>
            <AdminOrderHistoryPage />
          </PrivateRoute>
        }
      />

      {/* Motoboy */}
      <Route
        path="/motoboy"
        element={
          <PrivateRoute allowedRoles={["MOTOBOY", "ADMIN", "FUNCIONARIO"]}>
            <MotoboyPage />
          </PrivateRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
