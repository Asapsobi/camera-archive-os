import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/global.css";
import "./styles/window.css";
import "./styles/controls.css";
import "./styles/effects.css";
import "./styles/desktop.css";
import "./styles/catalog.css";
import "./styles/winamp.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
