import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { App } from "./app";

export type { TMediaEventFilter } from "../media-event-filter";

function Demo({ rootEl }: { rootEl: HTMLDivElement }) {
  createRoot(rootEl).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

export { Demo };
