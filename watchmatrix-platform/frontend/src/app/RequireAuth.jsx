import { Navigate, useLocation } from "react-router-dom";
import { getAccessToken } from "../lib/authStorage";

export default function RequireAuth({ children }) {
  const location = useLocation();
  const token = getAccessToken();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
