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
        <div className="max-w-[460px] rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 p-5">
          <p className="text-slate-200"><strong>Name:</strong> {profileQuery.data.fullName}</p>
          <p className="text-slate-200"><strong>Email:</strong> {profileQuery.data.email}</p>
          <button className="rounded-full border border-white/15 bg-slate-900 px-4 py-2 text-slate-100" type="button" onClick={onLogout}>Logout</button>
        </div>
      ) : null}
    </PageShell>
  );
}
