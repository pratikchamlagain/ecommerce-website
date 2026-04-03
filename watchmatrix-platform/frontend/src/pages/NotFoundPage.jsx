import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>404</h1>
      <p>Page not found.</p>
      <Link to="/">Go back home</Link>
    </div>
  );
}
