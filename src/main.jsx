import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/global.css";
import "./styles/window.css";
import "./styles/controls.css";
import "./styles/effects.css";
import "./styles/desktop.css";
import "./styles/catalog.css";
import "./styles/winamp.css";
import "./admin/admin.css";
import App from "./App.jsx";
import AdminApp from "./admin/AdminApp.jsx";

const isAdmin = window.location.pathname.startsWith("/admin");

createRoot(document.getElementById("root")).render(
  <StrictMode>{isAdmin ? <AdminApp /> : <App />}</StrictMode>
);
