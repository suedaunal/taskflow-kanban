"use client";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
  DndContext,
  closestCenter,
  useDroppable,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
} from "@dnd-kit/core";
import { useEffect } from "react";
import { supabase } from "@/app/lib/supabase";

import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type Card = {
  id: string;
  title: string;
  description?: string;
  priority?: "Low" | "Medium" | "High";
};

type Column = {
  id: string;
  title: string;
  cards: Card[];
};

function SortableCard({
  card,
  onUpdate,
  onDelete,
}: {
  card: Card;
  onUpdate: (
  cardId: string,
  title: string,
  description: string,
  priority: "Low" | "Medium" | "High"
) => void;
  onDelete: (cardId: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [localTitle, setLocalTitle] = useState(card.title);
  const [localDesc, setLocalDesc] = useState(card.description || "");
  const [localPriority, setLocalPriority] = useState<"Low" | "Medium" | "High">(
  card.priority || "Medium"
);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const saveEdit = () => {
    if (!localTitle.trim()) return;
    onUpdate(card.id, localTitle, localDesc, localPriority);
    setIsEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-black/45 text-white rounded-xl p-3 shadow-md border border-white/10 touch-none select-none cursor-grab active:cursor-grabbing hover:shadow-xl hover:scale-[1.02] transition-all duration-200 ${
  isDragging ? "opacity-50 scale-105" : ""
}`}
    >
      {isEditing ? (
        <div className="space-y-2">
          <input
            value={localTitle}
            onChange={(e) => setLocalTitle(e.target.value)}
            className="w-full rounded border px-2 py-1 text-sm text-slate-900"
            placeholder="Kart başlığı"
          />

          <textarea
            value={localDesc}
            onChange={(e) => setLocalDesc(e.target.value)}
            className="w-full rounded border px-2 py-1 text-sm text-slate-900"
            placeholder="Açıklama"
          />
<select
  value={localPriority}
  onChange={(e) =>
    setLocalPriority(e.target.value as "Low" | "Medium" | "High")
  }
  className="w-full rounded border px-2 py-1 text-sm text-slate-900"
>
  <option value="Low">Low Priority</option>
  <option value="Medium">Medium Priority</option>
  <option value="High">High Priority</option>
</select>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={saveEdit}
              className="bg-green-600 text-white px-2 py-1 rounded text-xs"
            >
              Kaydet
            </button>

            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="bg-slate-300 text-slate-900 px-2 py-1 rounded text-xs"
            >
              İptal
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-between gap-2">
          <div
  onClick={(e) => {
    e.stopPropagation();
    setIsEditing(true);
  }}
  className="flex-1"
>
            <p className="font-medium">{card.title}</p>
            <span
  className={`inline-block mt-2 text-[10px] px-2 py-1 rounded-full ${
    card.priority === "High"
      ? "bg-red-500/80"
      : card.priority === "Low"
      ? "bg-green-500/80"
      : "bg-yellow-500/80 text-black"
  }`}
>
  {card.priority || "Medium"}
</span>
            {card.description && (
              <p className="text-xs text-slate-300 mt-1">
                {card.description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(card.id);
            }}
            className="text-xs text-red-300 hover:text-red-200"
          >
            Sil
          </button>
        </div>
      )}
    </div>
  );
}
function DroppableColumn({
  column,
  children,
}: {
  column: Column;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${column.id}`,
  });

  return (
    <section
      ref={setNodeRef}
      className={`w-72 shrink-0 rounded-2xl p-4 shadow-2xl text-white border border-white/10 backdrop-blur-md ${
        column.title === "Backlog"
          ? "bg-purple-900/70"
          : column.title === "In Progress"
         ? "bg-yellow-800/70"
          : column.title === "Review"
          ? "bg-yellow-800/70"
          : column.title === "Done"
          ? "bg-black/70"
          : "bg-slate-800"
      } ${isOver ? "ring-2 ring-blue-400" : ""}`}
    >
      {children}
    </section>
  );
}
export default function BoardPage() {
  const router = useRouter();
  const params = useParams();
  const boardId = params.boardId as string;
const [boardTitle, setBoardTitle] = useState("");
const [columns, setColumns] = useState<Column[]>([]);
const defaultColumns: Column[] = [
  {
    id: "default-todo",
    title: "To Do",
    cards: [
      {
        id: "default-card-1",
        title: "Create project plan",
        description: "Planı hazırla ve görevleri ayır.",
      },
      {
        id: "default-card-2",
        title: "Prepare requirements",
        description: "Gereksinimleri netleştir.",
      },
    ],
  },
  {
    id: "default-progress",
    title: "In Progress",
    cards: [
      {
        id: "default-card-3",
        title: "Build dashboard",
        description: "Dashboard arayüzünü geliştir.",
      },
    ],
  },
  {
    id: "default-done",
    title: "Done",
    cards: [
      {
        id: "default-card-4",
        title: "Create workspace",
        description: "Workspace yapısı oluşturuldu.",
      },
    ],
  },
];
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [isAddingColumn, setIsAddingColumn] = useState(false);
const [newColumnTitle, setNewColumnTitle] = useState("");
const [searchTerm, setSearchTerm] = useState("");
const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8,
    },
  }),
  useSensor(TouchSensor, {
    activationConstraint: {
      delay: 250,
      tolerance: 5,
    },
  })
);
useEffect(() => {
  const fetchData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }
   const { data: boardData } = await supabase
  .from("boards")
  .select("title")
  .eq("id", boardId)
  .single();

setBoardTitle(boardData?.title || "Board");


const { data: columnsData, error: colError } = await supabase
  .from("columns")
  .select("*")
  .eq("board_id", boardId)
  .order("position", { ascending: true });

    const { data: cardsData, error: cardError } = await supabase
      .from("cards")
      .select("*");

    if (colError || cardError) {
      console.error(colError || cardError);
      return;
    }
if (!columnsData || columnsData.length === 0) {
  setColumns(defaultColumns);
  return;
}
    const mapped = columnsData.map((col) => ({
      id: col.id,
      title: col.title,
      cards: cardsData
        .filter((card: any) => card.column_id === col.id)
.sort((a: any, b: any) => a.position - b.position)
.map((card: any) => ({
  id: card.id,
  title: card.title,
  description: card.description,
  priority: card.priority || "Medium",
}))
    }));

    setColumns(mapped);
  };

  fetchData();
}, [boardId, router]);
const addCard = async (columnId: string) => {
  if (!newCardTitle.trim()) return;

  const column = columns.find((col) => col.id === columnId);
  const lastCard = column?.cards[column.cards.length - 1];

  const newPosition = lastCard ? column.cards.length * 1000 + 1000 : 1000;

  const { data, error } = await supabase
    .from("cards")
    .insert({
      column_id: columnId,
      title: newCardTitle,
      description: "",
priority: "Medium",
position: newPosition,
    })
    .select()
    .single();

  if (error) {
    console.error(error);
    return;
  }

  setColumns((prev) =>
    prev.map((column) =>
      column.id === columnId
        ? {
            ...column,
            cards: [
              ...column.cards,
              {
                id: data.id,
                title: data.title,
                description: data.description,
                priority: data.priority || "Medium",
              },
            ],
          }
        : column
    )
  );

  setNewCardTitle("");
  setActiveColumnId(null);
};
const addColumn = async () => {
  if (!newColumnTitle.trim()) return;

  const newPosition =
    columns.length > 0 ? columns.length * 1000 + 1000 : 1000;

  const { data, error } = await supabase
    .from("columns")
    .insert({
      board_id: boardId,
      title: newColumnTitle,
      position: newPosition,
    })
    .select()
    .single();

  if (error) {
    console.error(error);
    return;
  }

  setColumns((prev) => [
    ...prev,
    {
      id: data.id,
      title: data.title,
      cards: [],
    },
  ]);

  setNewColumnTitle("");
  setIsAddingColumn(false);
};
  const updateCard = async (
  cardId: string,
  title: string,
  description: string,
  priority: "Low" | "Medium" | "High"
) => {
  const { error } = await supabase
    .from("cards")
    .update({
  title,
  description,
  priority,
})
    .eq("id", cardId);

  if (error) {
    console.error(error);
    return;
  }

  setColumns((prev) =>
    prev.map((column) => ({
      ...column,
      cards: column.cards.map((card) =>
        card.id === cardId
          ? { ...card, title, description, priority }
          : card
      ),
    }))
  );
};
const deleteCard = async (cardId: string) => {
  const { error } = await supabase
    .from("cards")
    .delete()
    .eq("id", cardId);

  if (error) {
    console.error(error);
    return;
  }

  setColumns((prev) =>
    prev.map((column) => ({
      ...column,
      cards: column.cards.filter((card) => card.id !== cardId),
    }))
  );
};
const handleDragEnd = async (event: any) => {
  const { active, over } = event;

  if (!over || active.id === over.id) return;

  const sourceColumn = columns.find((column) =>
    column.cards.some((card) => card.id === active.id)
  );

  let targetColumn = columns.find((column) =>
  column.cards.some((card) => card.id === over.id)
);

// BOŞ SÜTUN FIX
if (!targetColumn && String(over.id).startsWith("column-")) {
  const columnId = String(over.id).replace("column-", "");
  targetColumn = columns.find((column) => column.id === columnId);
}

if (!sourceColumn || !targetColumn) return;

  const activeCard = sourceColumn.cards.find((card) => card.id === active.id);
  if (!activeCard) return;

  const oldIndex = sourceColumn.cards.findIndex((card) => card.id === active.id);
  let newIndex = targetColumn.cards.findIndex((card) => card.id === over.id);

if (newIndex === -1) {
  newIndex = targetColumn.cards.length;
}

  // Aynı sütun içinde sıralama
  if (sourceColumn.id === targetColumn.id) {
    const reorderedCards = arrayMove(sourceColumn.cards, oldIndex, newIndex);

    setColumns((prev) =>
      prev.map((column) =>
        column.id === sourceColumn.id
          ? { ...column, cards: reorderedCards }
          : column
      )
    );

    await Promise.all(
      reorderedCards.map((card, index) =>
        supabase
          .from("cards")
          .update({ position: (index + 1) * 1000 })
          .eq("id", card.id)
      )
    );

    return;
  }

  // Farklı sütuna taşıma
  const sourceCards = sourceColumn.cards.filter(
    (card) => card.id !== active.id
  );

  const targetCards = [...targetColumn.cards];
  targetCards.splice(newIndex, 0, activeCard);

  setColumns((prev) =>
    prev.map((column) => {
      if (column.id === sourceColumn.id) {
        return { ...column, cards: sourceCards };
      }

      if (column.id === targetColumn.id) {
        return { ...column, cards: targetCards };
      }

      return column;
    })
  );

  await supabase
    .from("cards")
    .update({
      column_id: targetColumn.id,
      position: (newIndex + 1) * 1000,
    })
    .eq("id", activeCard.id);

  await Promise.all(
    targetCards.map((card, index) =>
      supabase
        .from("cards")
        .update({ position: (index + 1) * 1000 })
        .eq("id", card.id)
    )
  );

  await Promise.all(
    sourceCards.map((card, index) =>
      supabase
        .from("cards")
        .update({ position: (index + 1) * 1000 })
        .eq("id", card.id)
    )
  );
};
  return (
    <DndContext
  sensors={sensors}
  collisionDetection={closestCenter}
  onDragEnd={handleDragEnd}
>

     <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#7c3aed,_#111827_45%,_#020617_100%)] text-white">
  <nav className="h-14 bg-black/30 backdrop-blur border-b border-white/10 flex items-center justify-between px-6">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center font-bold">
        T
      </div>
      <span className="font-bold text-lg">TaskFlow</span>
    </div>

    <div className="flex items-center gap-3">
      <input
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  placeholder="Search cards..."
  className="hidden md:block bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-sm outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 transition"
/>

      <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-sm font-bold">
        S
      </div>
    </div>
  </nav>

  <section className="px-6 py-5">
    <div className="flex items-center justify-between mb-6">
      <div>
        <p className="text-sm text-slate-300">Workspace / Board</p>
       <h1 className="text-3xl font-bold tracking-tight">{boardTitle}</h1>
<p className="text-sm text-slate-400 mt-1">
  Organize, prioritize and track your team tasks.
</p>
      </div>

      <button
  onClick={() => {
    navigator.clipboard.writeText(window.location.href);
    alert("Board link copied!");
  }}
 className="bg-white/15 hover:bg-white/25 px-4 py-2 rounded-xl text-sm border border-white/10 transition"
>
  Share
</button>
    </div>

        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((column) => (
            <DroppableColumn key={column.id} column={column}>
              <h2 className="font-semibold mb-4">{column.title}</h2>

              <SortableContext
                items={column.cards.map((card) => card.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {column.cards
  .filter((card) => {
    const q = searchTerm.toLowerCase();
    return (
      card.title.toLowerCase().includes(q) ||
      (card.description || "").toLowerCase().includes(q)
    );
  })
  .map((card) => (
                   <SortableCard
  key={card.id}
  card={card}
  onUpdate={updateCard}
  onDelete={deleteCard}
/>
                  ))}
                </div>
              </SortableContext>

              {activeColumnId === column.id ? (
                <div className="mt-4 space-y-2">
                  <input
                    value={newCardTitle}
                    onChange={(e) => setNewCardTitle(e.target.value)}
                    placeholder="Kart başlığı..."
                    className="w-full rounded-lg px-3 py-2 text-slate-900"
                  />

                  <div className="flex gap-2">
                    <button
                      onClick={() => addCard(column.id)}
                      className="px-3 py-2 bg-green-600 rounded-lg text-sm"
                    >
                      Ekle
                    </button>

                    <button
                      onClick={() => {
                        setActiveColumnId(null);
                        setNewCardTitle("");
                      }}
                      className="px-3 py-2 bg-slate-700 rounded-lg text-sm"
                    >
                      İptal
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setActiveColumnId(column.id)}
                  className="mt-4 text-sm text-slate-300 hover:text-white"
                >
                  + Add a card
                </button>
              )}
            </DroppableColumn>
          ))}

          {isAddingColumn ? (
  <div className="w-72 shrink-0 bg-slate-800 rounded-xl p-4 h-fit">
    <input
      value={newColumnTitle}
      onChange={(e) => setNewColumnTitle(e.target.value)}
      placeholder="Sütun başlığı..."
      className="w-full rounded-lg px-3 py-2 text-slate-900"
    />

    <div className="flex gap-2 mt-2">
      <button
        onClick={addColumn}
        className="px-3 py-2 bg-green-600 rounded-lg text-sm"
      >
        Ekle
      </button>

      <button
        onClick={() => {
          setIsAddingColumn(false);
          setNewColumnTitle("");
        }}
        className="px-3 py-2 bg-slate-700 rounded-lg text-sm"
      >
        İptal
      </button>
    </div>
  </div>
) : (
  <button
    onClick={() => setIsAddingColumn(true)}
    className="w-72 shrink-0 h-12 bg-white/10 rounded-xl hover:bg-white/20"
  >
    + Add another list
  </button>
)}
        </div>
     
           </section>
    </main>
    </DndContext>
  );
}