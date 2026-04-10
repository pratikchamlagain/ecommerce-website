import { createBrowserRouter } from "react-router-dom";
import HomePage from "../pages/HomePage";
import ProductsPage from "../pages/ProductsPage";
import ProductDetailPage from "../pages/ProductDetailPage";
import CartPage from "../pages/CartPage";
import CheckoutPage from "../pages/CheckoutPage";
import OrderSuccessPage from "../pages/OrderSuccessPage";
import PaymentReturnPage from "../pages/PaymentReturnPage";
import OrderDetailPage from "../pages/OrderDetailPage";
import SellerDashboardPage from "../pages/SellerDashboardPage";
import AdminDashboardPage from "../pages/AdminDashboardPage";
import AdminOrderDetailPage from "../pages/AdminOrderDetailPage";
import AboutPage from "../pages/AboutPage";
import NotFoundPage from "../pages/NotFoundPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ProfilePage from "../pages/ProfilePage";
import ChatPage from "../pages/ChatPage";
import RequireAuth from "./RequireAuth";

export const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },
  { path: "/products", element: <ProductsPage /> },
  { path: "/products/:slug", element: <ProductDetailPage /> },
  { path: "/cart", element: <CartPage /> },
  { path: "/checkout", element: <CheckoutPage /> },
  { path: "/order-success", element: <OrderSuccessPage /> },
  { path: "/payment-return", element: <PaymentReturnPage /> },
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
    path: "/admin/orders/:orderId",
    element: (
      <RequireAuth allowedRoles={["ADMIN"]}>
        <AdminOrderDetailPage />
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
  {
    path: "/chat",
    element: (
      <RequireAuth>
        <ChatPage />
      </RequireAuth>
    )
  },
  { path: "*", element: <NotFoundPage /> }
]);
