import { createBrowserRouter } from "react-router-dom";
import HomePage from "../pages/HomePage";
import ProductsPage from "../pages/ProductsPage";
import ProductDetailPage from "../pages/ProductDetailPage";
import CartPage from "../pages/CartPage";
import CheckoutPage from "../pages/CheckoutPage";
import OrderSuccessPage from "../pages/OrderSuccessPage";
import OrderDetailPage from "../pages/OrderDetailPage";
import SellerDashboardPage from "../pages/SellerDashboardPage";
import AdminDashboardPage from "../pages/AdminDashboardPage";
import AboutPage from "../pages/AboutPage";
import NotFoundPage from "../pages/NotFoundPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ProfilePage from "../pages/ProfilePage";
import RequireAuth from "./RequireAuth";

export const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },
  { path: "/products", element: <ProductsPage /> },
  { path: "/products/:slug", element: <ProductDetailPage /> },
  { path: "/cart", element: <CartPage /> },
  { path: "/checkout", element: <CheckoutPage /> },
  { path: "/order-success", element: <OrderSuccessPage /> },
  {
    path: "/seller",
    element: (
      <RequireAuth allowedRoles={["SELLER"]}>
        <SellerDashboardPage />
      </RequireAuth>
    )
  },
  {
    path: "/admin",
    element: (
      <RequireAuth allowedRoles={["ADMIN"]}>
        <AdminDashboardPage />
      </RequireAuth>
    )
  },
  {
    path: "/orders/:orderId",
    element: (
      <RequireAuth>
        <OrderDetailPage />
      </RequireAuth>
    )
  },
  { path: "/about", element: <AboutPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  {
    path: "/profile",
    element: (
      <RequireAuth>
        <ProfilePage />
      </RequireAuth>
    )
  },
  { path: "*", element: <NotFoundPage /> }
]);
