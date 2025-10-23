import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Toaster />
    <App />
  </BrowserRouter>
);
