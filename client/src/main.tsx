import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { GraphProvider } from "./contexts/GraphContext";
import { MobileProvider } from "./hooks/use-mobile";
import { StyleProvider } from "./contexts/StyleContext";

createRoot(document.getElementById("root")!).render(
  <MobileProvider>
    <GraphProvider>
      <StyleProvider>
        <App />
      </StyleProvider>
    </GraphProvider>
  </MobileProvider>
);
