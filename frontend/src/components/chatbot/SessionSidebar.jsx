import { Plus, MessageSquare, Trash2 } from "lucide-react";

export default function SessionSidebar({
  sessions = [],
  selectedSession,
  onSessionSelect,
  onNewChat,
  onSessionDelete,
}) {
  return (
    <div className="w-64 bg-slate-50 text-slate-800 h-screen flex flex-col border-r border-slate-200 font-sans shadow-sm">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <h2 className="font-semibold text-lg tracking-wide text-neutral-800">
          Chat History
        </h2>
      </div>

      <div className="p-3">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-neutral-800 hover:bg-neutral-900 text-white rounded-xl font-medium shadow-md shadow-neutral-200 transition-all duration-200 active:scale-[0.98] cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>New Chat</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
        {sessions.length === 0 ? (
          <div className="text-center text-slate-400 py-8 text-sm italic">
            No chats yet
          </div>
        ) : (
          sessions.map((session) => {
            const isSelected = selectedSession === session.id;
            return (
              <div
                key={session.id}
                onClick={() => onSessionSelect(session.id)}
                className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 border border-transparent ${
                  isSelected
                    ? "bg-neutral-200/80 border-neutral-300 text-neutral-950 shadow-sm"
                    : "hover:bg-slate-200/50 text-slate-600 hover:text-slate-800"
                }`}
              >
                <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                  <MessageSquare
                    className={`w-4 h-4 flex-shrink-0 ${
                      isSelected ? "text-neutral-700" : "text-slate-400 group-hover:text-slate-500"
                    }`}
                  />
                  <span className={`text-sm font-semibold truncate block ${isSelected ? "text-neutral-900" : ""}`}>
                    {session.title || "New Chat"}
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSessionDelete(session.id);
                  }}
                  aria-label="Delete Session"
                  className={`p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-200/80 transition-all duration-150 active:scale-95 cursor-pointer ${
                    isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
