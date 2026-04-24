"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";

type Board = {
  id: string;
  title: string;
};

export default function Dashboard() {
  const router = useRouter();

  const [boards, setBoards] = useState<Board[]>([]);
  const [inputOpen, setInputOpen] = useState(false);
  const [newBoard, setNewBoard] = useState("");

 const createDefaultBoardContent = async (boardId: string) => {
  const { data: columnData, error: columnError } = await supabase
    .from("columns")
    .insert([
      { board_id: boardId, title: "Backlog", position: 1000 },
      { board_id: boardId, title: "In Progress", position: 2000 },
      { board_id: boardId, title: "Review", position: 3000 },
      { board_id: boardId, title: "Done", position: 4000 },
    ])
    .select();

  if (columnError) {
    console.error(columnError);
    return;
  }

  const backlog = columnData?.find((c) => c.title === "Backlog");
  const progress = columnData?.find((c) => c.title === "In Progress");
  const review = columnData?.find((c) => c.title === "Review");
  const done = columnData?.find((c) => c.title === "Done");

  await supabase.from("cards").insert([
    {
      column_id: backlog?.id,
      title: "Create project brief",
      description: "Proje kapsamını ve hedeflerini yaz.",
      position: 1000,
    },
    {
      column_id: backlog?.id,
      title: "Prepare task list",
      description: "Başlangıç görevlerini listele.",
      position: 2000,
    },
    {
      column_id: progress?.id,
      title: "Design workflow",
      description: "Board akışını düzenle.",
      position: 1000,
    },
    {
      column_id: review?.id,
      title: "Review requirements",
      description: "Gereksinimleri kontrol et.",
      position: 1000,
    },
    {
      column_id: done?.id,
      title: "Create workspace",
      description: "Workspace yapısı oluşturuldu.",
      position: 1000,
    },
  ]);
};

const fetchBoards = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    setBoards([]);
    return;
  }

  const { data, error } = await supabase
    .from("boards")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  if (!data || data.length === 0) {
    const { data: defaultBoards, error: boardError } = await supabase
      .from("boards")
      .insert([
        { title: "Product", owner_id: user.id },
        { title: "Marketing", owner_id: user.id },
      ])
      .select();

    if (boardError) {
      console.error(boardError);
      return;
    }

    for (const board of defaultBoards || []) {
      await createDefaultBoardContent(board.id);
    }

    setBoards(defaultBoards || []);
    return;
  }

  setBoards(data || []);
};
  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      fetchBoards();
    };

    init();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const addBoard = async () => {
  if (!newBoard.trim()) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { data: boardData, error: boardError } = await supabase
    .from("boards")
    .insert({
      title: newBoard,
      owner_id: user.id,
    })
    .select()
    .single();

  if (boardError) {
    console.error(boardError);
    return;
  }

  const { data: columnData, error: columnError } = await supabase
    .from("columns")
    .insert([
      { board_id: boardData.id, title: "Backlog", position: 1000 },
      { board_id: boardData.id, title: "In Progress", position: 2000 },
      { board_id: boardData.id, title: "Review", position: 3000 },
      { board_id: boardData.id, title: "Done", position: 4000 },
    ])
    .select();

  if (columnError) {
    console.error(columnError);
    return;
  }

  const backlog = columnData?.find((col) => col.title === "Backlog");
  const inProgress = columnData?.find((col) => col.title === "In Progress");
  const review = columnData?.find((col) => col.title === "Review");

  if (backlog && inProgress && review) {
    const { error: cardError } = await supabase.from("cards").insert([
      {
        column_id: backlog.id,
        title: "Define project scope",
        description: "Board içindeki görev kapsamını belirle.",
        position: 1000,
      },
      {
        column_id: backlog.id,
        title: "Create task list",
        description: "Başlangıç görevlerini listele.",
        position: 2000,
      },
      {
        column_id: inProgress.id,
        title: "Design workflow",
        description: "Süreç akışını oluştur.",
        position: 1000,
      },
      {
        column_id: review.id,
        title: "Review requirements",
        description: "Gereksinimleri kontrol et.",
        position: 1000,
      },
    ]);

    if (cardError) {
      console.error(cardError);
    }
  }

  setNewBoard("");
  setInputOpen(false);
  fetchBoards();

  router.push(`/board/${boardData.id}`);
};

  return (
  <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
    <nav className="h-14 bg-black/30 backdrop-blur border-b border-white/10 flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center font-bold">
          T
        </div>
        <span className="font-bold text-lg">TaskFlow</span>
      </div>

      <button
        onClick={logout}
        className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm"
      >
        Logout
      </button>
    </nav>

    <section className="p-8">
      <div className="mb-8">
        <p className="text-sm text-slate-400">Workspace</p>
        <h1 className="text-3xl font-bold">Your Boards</h1>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {boards.map((b) => (
          <Link
            key={b.id}
            href={`/board/${b.id}`}
            className="h-32 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 p-4 flex flex-col justify-between transition shadow-lg"
          >
            <div>
              <p className="text-lg font-semibold">{b.title}</p>
              <p className="text-sm text-slate-400 mt-1">Kanban board</p>
            </div>

            <span className="text-xs text-slate-300">Open board →</span>
          </Link>
        ))}

        {inputOpen ? (
          <div className="h-32 rounded-2xl bg-white/10 border border-white/10 p-4">
            <input
              value={newBoard}
              onChange={(e) => setNewBoard(e.target.value)}
              placeholder="Board adı..."
              className="w-full px-3 py-2 rounded-lg text-slate-900"
            />

            <div className="flex gap-2 mt-3">
              <button
                onClick={addBoard}
                className="px-3 py-2 bg-green-600 rounded-lg text-sm"
              >
                Ekle
              </button>

              <button
                onClick={() => {
                  setInputOpen(false);
                  setNewBoard("");
                }}
                className="px-3 py-2 bg-slate-700 rounded-lg text-sm"
              >
                İptal
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setInputOpen(true)}
            className="h-32 rounded-2xl bg-blue-600/80 hover:bg-blue-600 border border-blue-400/30 p-4 text-lg font-semibold transition shadow-lg"
          >
            + Yeni Board
          </button>
        )}
      </div>
    </section>
  </main>
);
}