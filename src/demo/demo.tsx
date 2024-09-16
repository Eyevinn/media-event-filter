import {
  FilteredMediaEvent,
  MediaEvent,
  getMediaEventFilter,
} from "../media-event-filter";
import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { App } from "./app";

export type { TMediaEventFilter } from "../media-event-filter";

function Demo({ rootEl }: { rootEl: HTMLDivElement }) {
  const mp4Video = [
    "https://testcontent.eyevinn.technology/mp4/VINN.mp4",
    "https://testcontent.eyevinn.technology/mp4/stswe-tvplus-promo.mp4",
  ];
  const dash = [];
  const hls = [];

  createRoot(rootEl).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );

  const mediaEl: HTMLVideoElement = document.createElement("video");

  let i = 1;
  let seekOrBufferTimestamp = 0;

  mediaEl.src = mp4Video[0];

  // switchButton.onclick = () => {
  //   mediaEl.src = mediaEl.src !== mp4Video[0] ? mp4Video[0] : mp4Video[1];
  // };
  //
  // clearButton.onclick = () => {
  //   mediaEl.src = "";
  // };
  //
  // loadButton.onclick = () => {
  //   mediaEl.load();
  // };
}

export { Demo };
