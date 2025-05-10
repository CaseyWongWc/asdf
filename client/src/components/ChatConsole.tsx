
import React, { useState } from "react";
import { Terminal } from "lucide-react";

interface ConsoleEntry {
  type: "input" | "output" | "error";
  content: string;
  timestamp: Date;
}

export default function ChatConsole() {

  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  async function askGPT() {
    setLoading(true);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        throw new Error("Failed to get response");
      }

      const data = await res.json();
      setResponse(data.response);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "An unexpected error occurred";
      setResponse("Error: " + errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: "1rem", background: "#111", color: "#eee" }}>
      <h3>🧠 GPT Assistant</h3>
      <textarea
        style={{ width: "100%", height: "60px", marginBottom: "0.5rem" }}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Ask a question about the graph..."
      />
      <button onClick={askGPT} disabled={loading}>
        {loading ? "Thinking..." : "Ask GPT"}
      </button>
      <pre style={{ marginTop: "1rem", whiteSpace: "pre-wrap" }}>
        {response}
      </pre>
    </div>
  );
}
