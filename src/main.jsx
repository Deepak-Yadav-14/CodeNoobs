import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import CodeBuddy from "./components/CodeBuddy";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <CodeBuddy />
  </StrictMode>
);
