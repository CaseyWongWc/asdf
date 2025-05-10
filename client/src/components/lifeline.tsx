
import React, { useState, useRef, useEffect } from "react";
import { Terminal } from "lucide-react";

interface ConsoleEntry {
  type: "input" | "output" | "error" | "raw";
  content: string;
  timestamp: Date;
}

export default function Lifeline() {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<ConsoleEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const consoleEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [history]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  async function sendCommand(cmd: string) {
    if (!cmd.trim()) return;
    
    const newEntry: ConsoleEntry = {
      type: "input",
      content: cmd,
      timestamp: new Date()
    };
    
    setHistory(prev => [...prev, newEntry]);
    setLoading(true);
    
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
      
      if (data.commandOutput) {
        const rawOutputEntry: ConsoleEntry = {
          type: "raw",
          content: data.commandOutput,
          timestamp: new Date()
        };
        
        setHistory(prev => [...prev, rawOutputEntry]);
      }
      
      const responseEntry: ConsoleEntry = {
        type: "output",
        content: data.response,
        timestamp: new Date()
      };
      
      setHistory(prev => [...prev, responseEntry]);
    } catch (err: any) {
      const errorMessage = err.message || "An unexpected error occurred";
      
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
      <div className="flex items-center justify-between p-2 border-b border-gray-800 bg-gray-900">
        <div className="flex items-center">
          <Terminal size={18} className="mr-2" />
          <h3 className="font-bold">GPT Terminal</h3>
        </div>
        <div className="text-xs text-gray-400">Executes real bash commands with GPT explanation</div>
      </div>
      
      <div className="flex-1 p-2 overflow-y-auto">
        {history.length === 0 && (
          <div className="p-4 text-gray-300 space-y-3 bg-gray-900 rounded-md border border-gray-700">
            <p className="text-yellow-400 font-bold">Welcome to GPT Terminal</p>
            <p>This terminal executes real bash commands and uses GPT-4o to explain their output.</p>
            <p>Try these examples:</p>
            <ul className="list-disc pl-5 text-blue-400">
              <li><code>ls -la</code> - List all files with details</li>
              <li><code>ps aux</code> - Show running processes</li>
              <li><code>df -h</code> - Show disk usage</li>
              <li><code>uname -a</code> - Show system information</li>
            </ul>
            <p className="text-gray-400 text-sm mt-4">Press Enter to execute commands. Use Up/Down arrows to navigate command history.</p>
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
            ) : entry.type === "raw" ? (
              <div className="p-2 mt-1 mb-1 bg-gray-900 border border-gray-700 rounded">
                <div className="text-xs text-gray-500 mb-1">Command Output:</div>
                <pre className="text-white text-sm overflow-x-auto whitespace-pre-wrap font-mono">{entry.content}</pre>
              </div>
            ) : entry.type === "error" ? (
              <div className="text-red-400 whitespace-pre-wrap">{entry.content}</div>
            ) : (
              <div className="p-2 mt-1 mb-2 border-l-4 border-green-500 pl-3">
                <div className="text-green-400 whitespace-pre-wrap">{entry.content}</div>
              </div>
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
