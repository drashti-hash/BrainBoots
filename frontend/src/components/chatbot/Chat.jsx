import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Message from "./Message";
import MessageInput from "./MessageInput";
import TypingIndicator from "./TypingIndicator";
import SessionSidebar from "./SessionSidebar";
import toast from 'react-hot-toast';
import { Bot, ArrowDown } from 'lucide-react';
import {
  createSession,
  sendMessageStream,
  getSessionMessages,
  getSessions,
  deleteSession,
  getDocuments,
  uploadDocument,
  deleteDocument
} from "./api/chat";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const abortControllerRef = useRef(null);
  const navigate = useNavigate();

  // Check authentication and load sessions on mount
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please login first");
      navigate("/login");
      return;
    }

    loadSessions(true);
    loadDocuments();
  }, [navigate]);

  const loadDocuments = async () => {
    try {
      const data = await getDocuments();
      setDocuments(data);
    } catch (error) {
      console.error("Failed to load documents:", error);
    }
  };

  const handleDocumentUpload = async (file) => {
    setIsUploading(true);
    const uploadPromise = uploadDocument(file)
      .then((res) => {
        loadDocuments();
        return res;
      })
      .finally(() => {
        setIsUploading(false);
      });

    toast.promise(uploadPromise, {
      loading: "Uploading and indexing document...",
      success: "Document indexed successfully! You can now chat about it.",
      error: (err) => err.response?.data?.error || "Failed to index document.",
    });
  };

  const handleDocumentDelete = async (id) => {
    const deletePromise = deleteDocument(id)
      .then((res) => {
        loadDocuments();
        return res;
      });

    toast.promise(deletePromise, {
      loading: "Deleting document...",
      success: "Document deleted successfully.",
      error: "Failed to delete document.",
    });
  };

  useEffect(() => {
    scrollToBottom(false);
  }, [messages]);

  const scrollToBottom = (force = false) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    if (force) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth"
      });
      return;
    }

    const threshold = 150;
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;

    if (distanceFromBottom <= threshold) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth"
      });
    }
  };

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    setShowScrollButton(distanceFromBottom > 300);
  };

  const loadSessions = async (shouldRestore = false) => {
    try {
      const data = await getSessions();
      setSessions(data);

      if (shouldRestore) {
        const savedSessionId = localStorage.getItem("current_session");
        if (savedSessionId) {
          const parsedId = parseInt(savedSessionId, 10);
          if (data.some((s) => s.id === parsedId)) {
            handleSessionSelect(parsedId);
          } else {
            localStorage.removeItem("current_session");
          }
        }
      }
    } catch (error) {
      console.error("Failed to load sessions:", error);
    }
  };

  const handleNewChat = () => {
    setSessionId(null);
    setSelectedSession(null);
    setMessages([]);
    localStorage.removeItem("current_session");
    handleStopGenerating();
  };

  const handleStopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  };

  const handleSessionDelete = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await deleteSession(id);
      toast.success("Session deleted successfully");
      setSessions((prev) => prev.filter((s) => s.id !== id));

      if (sessionId === id) {
        setSessionId(null);
        setSelectedSession(null);
        setMessages([]);
        localStorage.removeItem("current_session");
        handleStopGenerating();
      }
    } catch (error) {
      console.error("Failed to delete session:", error);
      toast.error("Failed to delete session");
    }
  };

  const sendMessage = async (text, file = null) => {
    let currentSessionId = sessionId;
    let documentId = null;

    setIsLoading(true);

    if (file) {
      try {
        const uploadToast = toast.loading("Uploading and indexing document...");
        const uploadRes = await uploadDocument(file);
        documentId = uploadRes.document?.id || uploadRes.id;
        toast.success("Document uploaded successfully! Analyzing...", { id: uploadToast });
        loadDocuments();
      } catch (error) {
        console.error("Failed to upload document during chat:", error);
        toast.error(error.response?.data?.error || "Failed to upload document. Message not sent.");
        setIsLoading(false);
        return;
      }
    }

    if (!currentSessionId) {
      try {
        const data = await createSession();
        currentSessionId = data.session_id;
        setSessionId(currentSessionId);
        setSelectedSession(currentSessionId);
        localStorage.setItem("current_session", currentSessionId);

        setSessions((prev) => [
          { id: currentSessionId, title: text.substring(0, 40) || "New Chat" },
          ...prev
        ]);
      } catch (error) {
        toast.error("Failed to create chat session");
        setIsLoading(false);
        return;
      }
    }

    const userMessage = {
      role: "user",
      text: file ? `[Attached PDF: ${file.name}] ${text}`.trim() : text,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);

    setTimeout(() => scrollToBottom(true), 50);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    await sendMessageStream(
      text,
      currentSessionId,
      (chunk) => {
        setMessages(prev => {
          const updated = [...prev];
          const lastMessage = updated[updated.length - 1];

          if (lastMessage && lastMessage.role === "user") {
            return [...updated, {
              role: "bot",
              text: chunk,
              timestamp: new Date().toISOString()
            }];
          } else {
            updated[updated.length - 1] = {
              ...lastMessage,
              text: lastMessage.text + chunk
            };
            return updated;
          }
        });
      },
      (error) => {
        if (error.name === 'AbortError') {
          console.log("Generation stopped by user.");
          return;
        }
        console.error("Stream error:", error);
        toast.error("Failed to get response from AI");
        setIsLoading(false);

        setMessages(prev => [
          ...prev,
          { role: "bot", text: "Sorry, I encountered an error. Please try again.", timestamp: new Date().toISOString() }
        ]);
      },
      controller.signal,
      documentId
    );

    setIsLoading(false);
    abortControllerRef.current = null;
    loadSessions();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("current_session");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const handleSessionSelect = async (id) => {
    handleStopGenerating();
    setSelectedSession(id);
    setSessionId(id);
    localStorage.setItem("current_session", id);

    try {
      const data = await getSessionMessages(id);

      const formatted = data.map((msg) => ({
        role: msg.role,
        text: msg.content,
        timestamp: msg.created_at,
      }));

      setMessages(formatted);
      setTimeout(() => scrollToBottom(true), 50);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="h-screen flex bg-gray-100 font-sans">
      {/* Session Sidebar */}
      <SessionSidebar
        sessions={sessions}
        selectedSession={selectedSession}
        onSessionSelect={handleSessionSelect}
        onNewChat={handleNewChat}
        onSessionDelete={handleSessionDelete}
      />
      <div className="flex-1 flex flex-col relative">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">AI Chat Assistant</h1>
            <p className="text-sm text-gray-500">Powered by Groq (Llama 3)</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 text-sm bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg font-medium transition cursor-pointer"
            >
              Back to Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-red-600 hover:text-red-700 font-medium cursor-pointer"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Messages Container */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-4 py-6"
        >
          <div className="max-w-4xl mx-auto">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-20">
                <Bot className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p>Start a conversation with the AI assistant!</p>
              </div>
            )}
            {messages.map((message, index) => (
              <Message
                key={index}
                role={message.role}
                text={message.text}
                timestamp={message.timestamp}
              />
            ))}
            {isLoading && messages.length > 0 && messages[messages.length - 1].role === "user" && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Floating Scroll to Bottom Button */}
        {showScrollButton && (
          <button
            onClick={() => scrollToBottom(true)}
            className="absolute bottom-24 right-8 p-3 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800 rounded-full border border-slate-200 shadow-md transition-all duration-200 hover:shadow-lg active:scale-95 cursor-pointer z-10 flex items-center justify-center"
            title="Scroll to bottom"
          >
            <ArrowDown className="w-5 h-5 animate-bounce" style={{ animationDuration: '2s' }} />
          </button>
        )}

        {/* Input Area */}
        <MessageInput onSend={sendMessage} onStop={handleStopGenerating} isLoading={isLoading} />
      </div>
    </div>
  );
}
