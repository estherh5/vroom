import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import App from "./App";

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

const footer = document.getElementById("footer");
if (footer) {
  createRoot(footer).render(
    <StrictMode>
      <span>
        © Copyright 2017–{new Date().getFullYear()}{" "}
        <a href="https://crystalprism.io" title="Crystal Prism">
          Crystal Prism
        </a>
      </span>
    </StrictMode>,
  );
}
