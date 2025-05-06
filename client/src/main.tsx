import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { GraphProvider } from "./contexts/GraphContext";

createRoot(document.getElementById("root")!).render(
  <GraphProvider>
    <App />
  </GraphProvider>
);
