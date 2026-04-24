import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#1e3a8a,_#020617_60%)] text-white px-6">
      <div className="text-center max-w-xl w-full bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-10 shadow-2xl">
        
        <h1 className="text-5xl font-bold tracking-tight mb-4">
          TaskFlow 🚀
        </h1>

        <p className="text-slate-300 text-lg mb-8 leading-relaxed">
          Tasks don’t get done by accident.
          <br />
          Track them. Move them. Finish them.
        </p>

        <Link
          href="/dashboard"
          className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-500 transition rounded-xl text-lg font-semibold shadow-lg hover:shadow-blue-500/30"
        >
          Open Dashboard
        </Link>

        <div className="mt-10 flex justify-center gap-6 text-sm text-slate-400">
          <span>⚡ Drag & Drop</span>
          <span>📱 Mobile Ready</span>
          <span>☁️ Synced</span>
        </div>

      </div>
    </main>
  );
}