import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./CSS/index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
