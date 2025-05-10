import React, { useState } from "react";
import { Configuration, OpenAI } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAI(configuration);

export default function Lifeline() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  async function askGPT() {
    setLoading(true);
    try {
      const res = await openai.createChatCompletion({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
      });
      setResponse(res.data.choices[0].message?.content || "");
    } catch (err) {
      setResponse("Something went wrong: " + err.message);
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
