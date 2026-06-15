import { useState, useRef } from "react";
import { FileText, Trash2, UploadCloud, Loader2, BookOpen } from "lucide-react";

export default function DocumentManager({
  documents = [],
  onUpload,
  onDelete,
  isUploading = false,
}) {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.toLowerCase().endsWith(".pdf")) {
        onUpload(file);
      } else {
        alert("Only PDF files are supported.");
      }
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="flex flex-col font-sans border-t border-slate-200 bg-slate-50/50">
      <div className="px-4 py-3 border-b border-slate-200 flex items-center space-x-2">
        <BookOpen className="w-4 h-4 text-indigo-600" />
        <h3 className="font-semibold text-slate-700 text-xs uppercase tracking-wider">
          Knowledge Base (PDF)
        </h3>
      </div>

      <div className="p-3">
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={triggerFileSelect}
          className={`border border-dashed rounded-xl p-3.5 text-center cursor-pointer transition-all duration-200 ${
            dragActive
              ? "border-indigo-500 bg-indigo-50/60"
              : "border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50"
          } ${isUploading ? "pointer-events-none opacity-60" : ""}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleChange}
            className="hidden"
          />
          {isUploading ? (
            <div className="flex flex-col items-center justify-center space-y-1.5 py-1">
              <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
              <span className="text-[11px] font-medium text-slate-500">
                Chunking & indexing...
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-1">
              <UploadCloud className="w-5 h-5 text-slate-400" />
              <span className="text-[11px] font-semibold text-slate-600">
                Upload PDF Document
              </span>
              <span className="text-[9px] text-slate-400">
                Drag & drop or click
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-y-auto px-3 pb-3 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent max-h-[140px]">
        {documents.length === 0 ? (
          <div className="text-center text-slate-400 py-4 text-[11px] italic">
            No documents uploaded
          </div>
        ) : (
          documents.map((doc) => {
            const rawName = doc.file ? doc.file.split("/").pop() : "document.pdf";
            const displayName = rawName.replace(/^documents\//, "");
            return (
              <div
                key={doc.id}
                className="group flex items-center justify-between p-1.5 rounded-lg bg-white border border-slate-100 hover:border-slate-200 shadow-sm transition-all duration-150"
              >
                <div className="flex items-center space-x-1.5 min-w-0 flex-1">
                  <FileText className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                  <span className="text-[11px] font-medium text-slate-600 truncate" title={displayName}>
                    {displayName}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(doc.id);
                  }}
                  className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-slate-50 transition-all duration-150 cursor-pointer"
                  aria-label="Delete document"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
