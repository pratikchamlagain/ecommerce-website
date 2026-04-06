import { Navigate, useLocation } from "react-router-dom";
import { getAccessToken, getAuthUser } from "../lib/authStorage";
import { getRoleHomePath } from "../lib/authRole";

export default function RequireAuth({ children, allowedRoles }) {
  const location = useLocation();
  const token = getAccessToken();
  const user = getAuthUser();

  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles?.length && !allowedRoles.includes(user.role)) {
    return <Navigate to={getRoleHomePath(user.role)} replace />;
  }

  return children;
}
