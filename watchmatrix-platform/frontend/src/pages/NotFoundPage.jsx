import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-b from-slate-950 via-slate-900 to-stone-950 p-5 text-slate-100">
      <article className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/70 p-8 text-center shadow-2xl shadow-black/30">
        <p className="m-0 text-sm uppercase tracking-[0.25em] text-amber-200/90">404 Error</p>
        <h1 className="mb-2 mt-3 text-4xl font-semibold text-white">Lost In Time</h1>
        <p className="mb-6 text-sm text-slate-300">The page you requested does not exist. Let&apos;s return to the storefront.</p>
        <Link className="inline-flex rounded-full border border-amber-200/50 bg-amber-200/10 px-4 py-2 text-sm font-semibold text-amber-100 hover:bg-amber-200/20" to="/">
          Back to Home
        </Link>
      </article>
    </div>
  );
}
