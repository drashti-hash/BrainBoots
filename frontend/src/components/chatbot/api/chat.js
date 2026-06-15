import axios from "axios";

const BASE_URL = "http://127.0.0.1:8080/api/chat";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const createSession = async () => {
  try {
    const res = await axios.post(`${BASE_URL}/session/create/`, {}, {
      headers: getAuthHeaders()
    });
    return res.data;
  } catch (error) {
    console.error("Create session error:", error);
    throw error;
  }
};

export const getSessions = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/sessions/`, {
      headers: getAuthHeaders()
    });
    return res.data;
  } catch (error) {
    console.error("Get sessions error:", error);
    throw error;
  }
};

export const getSessionMessages = async (sessionId) => {
  try {
    const res = await axios.get(`${BASE_URL}/sessions/${sessionId}/messages/`, {
      headers: getAuthHeaders()
    });
    return res.data;
  } catch (error) {
    console.error("Get session messages error:", error);
    throw error;
  }
};

export const deleteSession = async (sessionId) => {
  try {
    const res = await axios.delete(`${BASE_URL}/sessions/${sessionId}/delete/`, {
      headers: getAuthHeaders()
    });
    return res.data;
  } catch (error) {
    console.error("Delete session error:", error);
    throw error;
  }
};

export const getDocuments = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/documents/`, {
      headers: getAuthHeaders()
    });
    return res.data;
  } catch (error) {
    console.error("Get documents error:", error);
    throw error;
  }
};

export const uploadDocument = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const res = await axios.post(`${BASE_URL}/documents/upload/`, formData, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "multipart/form-data"
      }
    });
    return res.data;
  } catch (error) {
    console.error("Upload document error:", error);
    throw error;
  }
};

export const deleteDocument = async (documentId) => {
  try {
    const res = await axios.delete(`${BASE_URL}/documents/${documentId}/delete/`, {
      headers: getAuthHeaders()
    });
    return res.data;
  } catch (error) {
    console.error("Delete document error:", error);
    throw error;
  }
};

export const sendMessageStream = async (prompt, sessionId, onChunk, onError, signal, documentId = null) => {
  try {
    const token = localStorage.getItem("token");
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const body = {
      prompt,
      session_id: sessionId,
    };
    if (documentId) {
      body.document_id = documentId;
    }

    const response = await fetch(`${BASE_URL}/chat/stream/`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText || `Server responded with ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      if (value) {
        const chunk = decoder.decode(value, { stream: !done });
        onChunk(chunk);
      }
    }
  } catch (error) {
    if (error.name === "AbortError") {
      console.log("Stream aborted");
    } else {
      onError(error);
    }
  }
};