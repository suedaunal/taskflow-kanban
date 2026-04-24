import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white">
      <h1 className="text-4xl font-bold mb-4">TaskFlow 🚀</h1>

      <p className="text-lg text-gray-400 mb-8">
        Basit ve etkili Kanban proje yönetim aracı
      </p>

      <Link
        href="/dashboard"
        className="px-6 py-3 bg-blue-600 rounded-xl hover:bg-blue-700 transition"
      >
        Dashboard&apos;a Git
      </Link>
    </main>
  );
}