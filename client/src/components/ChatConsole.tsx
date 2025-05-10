import React, { useState, useRef, useEffect } from "react";
import { Terminal } from "lucide-react";

interface ConsoleEntry {
  type: "input" | "output" | "error";
  content: string;
  timestamp: Date;
}

export default function ChatConsole() {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<ConsoleEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const consoleEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new content is added
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [history]);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  async function sendCommand(cmd: string) {
    if (!cmd.trim()) return;
    
    // Add command to history
    const newEntry: ConsoleEntry = {
      type: "input",
      content: cmd,
      timestamp: new Date()
    };
    
    setHistory(prev => [...prev, newEntry]);
    setLoading(true);
    
    // Add to command history for up/down arrows
    setCommandHistory(prev => {
      const newHistory = [...prev];
      if (newHistory[newHistory.length - 1] !== cmd) {
        newHistory.push(cmd);
      }
      return newHistory;
    });
    setHistoryIndex(-1);
    
    try {
      const res = await fetch("/api/bash", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ command: cmd }),
      });

      if (!res.ok) {
        throw new Error("Failed to get response");
      }

      const data = await res.json();
      
      // Add response to history
      const responseEntry: ConsoleEntry = {
        type: "output",
        content: data.response,
        timestamp: new Date()
      };
      
      setHistory(prev => [...prev, responseEntry]);
    } catch (err: any) {
      const errorMessage = err.message || "An unexpected error occurred";
      
      // Add error to history
      const errorEntry: ConsoleEntry = {
        type: "error",
        content: "Error: " + errorMessage,
        timestamp: new Date()
      };
      
      setHistory(prev => [...prev, errorEntry]);
    } finally {
      setLoading(false);
      setInput("");
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendCommand(input);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex] || "");
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex] || "");
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput("");
      }
    }
  }

  function formatTimestamp(date: Date) {
    return date.toLocaleTimeString();
  }

  return (
    <div className="flex flex-col h-full border border-gray-800 rounded-md bg-black text-green-400 font-mono text-sm overflow-hidden">
      <div className="flex items-center p-2 border-b border-gray-800 bg-gray-900">
        <Terminal size={18} className="mr-2" />
        <h3 className="font-bold">GPT Terminal</h3>
      </div>
      
      <div className="flex-1 p-2 overflow-y-auto">
        {history.length === 0 && (
          <div className="text-gray-500 italic">
            Type a bash command and GPT will execute it and explain the output.
          </div>
        )}
        
        {history.map((entry, index) => (
          <div key={index} className="mb-2">
            {entry.type === "input" ? (
              <div>
                <span className="text-blue-400">[{formatTimestamp(entry.timestamp)}]</span>
                <span className="text-yellow-400"> $ </span>
                <span>{entry.content}</span>
              </div>
            ) : entry.type === "error" ? (
              <div className="text-red-400 whitespace-pre-wrap">{entry.content}</div>
            ) : (
              <div className="text-green-400 whitespace-pre-wrap">{entry.content}</div>
            )}
          </div>
        ))}
        
        {loading && (
          <div className="text-yellow-400">
            Processing command...
          </div>
        )}
        
        <div ref={consoleEndRef} />
      </div>
      
      <div className="flex items-center p-2 border-t border-gray-800 bg-gray-900">
        <span className="text-yellow-400 mr-2">$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent outline-none"
          placeholder="Type a bash command..."
          disabled={loading}
        />
      </div>
    </div>
  );
}