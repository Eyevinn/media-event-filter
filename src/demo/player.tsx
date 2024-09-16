import { useEngine } from "./engine";
import { useEffect, useMemo, useRef } from "react";
import { useNativeEvents } from "./native-events.hook";
import { useFilteredEvents } from "./filtered-events.hook";
import { useRenderEvents } from "./render-events.hook";
import { useControls } from "./controls.hook";
import { PlayerOptions } from "./types";

export const Player = ({ videoUrl, engine }: PlayerOptions) => {
  const videoContainerRef = useRef<HTMLDivElement>(null);

  // create new video element when options change
  // this video element is passed to underlying hooks, essentially creating a
  // new playback session by re-creating event filters and handlers.
  const video = useMemo(() => {
    const v = document.createElement("video");

    v.style.width = "100%";
    v.style.height = "auto";

    return v;
  }, [videoUrl, engine]);

  // insert video in container
  useEffect(() => {
    if (!videoContainerRef.current) return;

    videoContainerRef.current.appendChild(video);

    return () => {
      if (videoContainerRef.current) {
        videoContainerRef.current.removeChild(video);
      }
    };
  }, [videoContainerRef.current, video]);

  useNativeEvents({ video });

  const { playing, seeking, buffering, events, blocked, loading } =
    useFilteredEvents({ video });

  const renderEvents = useRenderEvents(events);

  useEngine({
    video,
    videoUrl,
    engine,
  });

  const { playPause, skip } = useControls({
    playing,
    video,
  });

  return (
    <div>
      <div ref={videoContainerRef} style={{ width: "100%", height: "auto" }} />
      <button type={"button"} onClick={playPause}>
        {playing ? "Pause" : "Play"}
      </button>
      <button type={"button"} onClick={() => skip(-10)}>
        Seek -10
      </button>
      <button type={"button"} onClick={() => skip(10)}>
        Seek +10
      </button>
      {renderEvents.map(({ seq, evt, dur }) => (
        <div key={seq}>
          {seq} {evt} {dur}
        </div>
      ))}
    </div>
  );
};
