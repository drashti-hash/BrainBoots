import { useState, useRef } from 'react';
import { Send, Square, Paperclip, X, FileText } from 'lucide-react';

export default function MessageInput({ onSend, onStop, isLoading }) {
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoading) {
      return;
    }
    if (input.trim() || selectedFile) {
      onSend(input.trim(), selectedFile);
      setInput("");
      setSelectedFile(null);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.name.toLowerCase().endsWith(".pdf")) {
        setSelectedFile(file);
      } else {
        alert("Only PDF files are supported.");
      }
    }
  };

  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200 bg-white p-4 flex flex-col space-y-3">
      {selectedFile && (
        <div className="flex items-center space-x-2 self-start bg-indigo-50 border border-indigo-100 rounded-lg p-1.5 px-3">
          <FileText className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-medium text-indigo-900 truncate max-w-xs">
            {selectedFile.name}
          </span>
          <button
            type="button"
            onClick={() => setSelectedFile(null)}
            className="p-0.5 hover:bg-indigo-100 rounded-full text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
            title="Remove attachment"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="flex space-x-4 items-end">
        <button
          type="button"
          onClick={triggerFileSelect}
          className="p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 rounded-lg border border-slate-200 transition-all flex items-center justify-center cursor-pointer active:scale-95"
          title="Attach PDF Document"
          disabled={isLoading}
        >
          <Paperclip className="w-5 h-5" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="hidden"
        />

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={selectedFile ? "Ask a question about this document..." : "Type your message..."}
          rows="1"
          className="flex-1 resize-none rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          style={{ minHeight: '44px', maxHeight: '120px' }}
        />

        {isLoading ? (
          <button
            type="button"
            onClick={onStop}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors flex items-center justify-center cursor-pointer"
            title="Stop generating"
          >
            <Square className="w-4 h-4 fill-white text-white" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim() && !selectedFile}
            className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium cursor-pointer"
          >
            <Send className="w-5 h-5" />
          </button>
        )}
      </div>
    </form>
  );
}
