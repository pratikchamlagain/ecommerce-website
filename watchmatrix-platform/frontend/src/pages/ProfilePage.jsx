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
      {profileQuery.isPending ? <p className="text-slate-300">Loading profile...</p> : null}
      {profileQuery.isError ? <p className="text-rose-300">Unable to load profile. Please sign in again.</p> : null}

      {profileQuery.data ? (
        <div className="wm-card max-w-[460px] p-5">
          <p className="text-slate-200"><strong>Name:</strong> {profileQuery.data.fullName}</p>
          <p className="text-slate-200"><strong>Email:</strong> {profileQuery.data.email}</p>
          <button className="wm-btn-secondary rounded-full px-4" type="button" onClick={onLogout}>Logout</button>
        </div>
      ) : null}
    </PageShell>
  );
}
