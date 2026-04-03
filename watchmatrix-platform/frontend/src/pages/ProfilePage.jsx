import { useQuery } from "@tanstack/react-query";
import PageShell from "../components/common/PageShell";
import { fetchMe } from "../lib/authApi";
import { clearAccessToken } from "../lib/authStorage";

export default function ProfilePage() {
  const profileQuery = useQuery({
    queryKey: ["me"],
    queryFn: fetchMe
  });

  function onLogout() {
    clearAccessToken();
    window.location.href = "/login";
  }

  return (
    <PageShell title="My Profile">
      {profileQuery.isPending ? <p>Loading profile...</p> : null}
      {profileQuery.isError ? <p>Unable to load profile. Please sign in again.</p> : null}

      {profileQuery.data ? (
        <div className="max-w-[420px] rounded-xl border border-slate-200 p-4">
          <p><strong>Name:</strong> {profileQuery.data.fullName}</p>
          <p><strong>Email:</strong> {profileQuery.data.email}</p>
          <button className="rounded-lg border border-slate-300 bg-slate-900 px-4 py-2 text-white" type="button" onClick={onLogout}>Logout</button>
        </div>
      ) : null}
    </PageShell>
  );
}
