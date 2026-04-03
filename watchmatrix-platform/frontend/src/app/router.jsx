import { createBrowserRouter } from "react-router-dom";
import HomePage from "../pages/HomePage";
import ProductsPage from "../pages/ProductsPage";
import CartPage from "../pages/CartPage";
import CheckoutPage from "../pages/CheckoutPage";
import AboutPage from "../pages/AboutPage";
import NotFoundPage from "../pages/NotFoundPage";

export const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },
  { path: "/products", element: <ProductsPage /> },
  { path: "/cart", element: <CartPage /> },
  { path: "/checkout", element: <CheckoutPage /> },
  { path: "/about", element: <AboutPage /> },
  { path: "*", element: <NotFoundPage /> }
]);
