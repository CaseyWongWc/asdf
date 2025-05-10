import React, { useState } from "react";

export default function Lifeline() {
  /*const [prompt, setPrompt] = useState("");
  const [entries, setEntries] = useState<ConsoleEntry[]>([]);
  const [loading, setLoading] = useState(false);

  async function executeCommand() {
    setLoading(true);
    try {
      const res = await fetch("/api/bash", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ command: prompt }),
      });

      if (!res.ok) {
        throw new Error("Failed to execute command");
      }

      const data = await res.json();

      // Add command to history
      setEntries(prev => [...prev, {
        type: "input",
        content: `$ ${prompt}`,
        timestamp: new Date()
      }]);

      // Add command output
      setEntries(prev => [...prev, {
        type: "output",
        content: data.response,
        timestamp: new Date()
      }]);

      setPrompt("");
    } catch (err: any) {
      const errorMessage = err.message || "An unexpected error occurred";
      setEntries(prev => [...prev, {
        type: "error",
        content: errorMessage,
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full" style={{ background: "#111", color: "#eee" }}>
      <div className="flex items-center gap-2 p-2 border-b border-gray-800">
        <Terminal size={20} />
        <h3 className="font-mono">Console</h3>
      </div>

      <div className="flex-1 overflow-auto p-2 font-mono text-sm">
        {entries.map((entry, i) => (
          <div 
            key={i} 
            className={`mb-2 ${
              entry.type === "error" ? "text-red-400" : 
              entry.type === "input" ? "text-blue-400" : ""
            }`}
          >
            {entry.content}
          </div>
        ))}
      </div>

      <div className="p-2 border-t border-gray-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && executeCommand()}
            placeholder="Enter bash command..."
            className="flex-1 bg-gray-900 text-white p-2 rounded font-mono"
          />
          <button 
            onClick={executeCommand} 
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Running..." : "Run"}
          </button>
        </div>
      </div>
    </div>
  );*/
}
