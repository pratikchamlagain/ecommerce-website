import { Link } from "react-router-dom";
import PageShell from "../components/common/PageShell";

export default function AdminDashboardPage() {
  return (
    <PageShell title="Admin Dashboard">
      <div className="wm-card max-w-[760px] p-6">
        <p className="m-0 text-slate-700">
          This is the admin workspace. Next steps will add platform moderation,
          seller approval, and marketplace analytics.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link className="wm-btn-secondary" to="/products">View Product Catalog</Link>
          <Link className="wm-btn-secondary" to="/profile">Account Profile</Link>
        </div>
      </div>
    </PageShell>
  );
}
