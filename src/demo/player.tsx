import { useEngine } from "./engine";
import { useEffect, useMemo, useRef } from "react";
import { useNativeEvents } from "./native-events.hook";
import { useFilteredEvents } from "./filtered-events.hook";
import { useRenderEvents } from "./render-events.hook";
import { useControls } from "./controls.hook";
import { PlayerOptions } from "./types";
import styled from "@emotion/styled";

const PlayerWrapper = styled.div`
  padding: 2rem;
`;

const Button = styled.button`
  color: #1a1a1a;
  padding: 0.2rem 1rem;
  margin: 0 0.2rem 0 0.2rem;
  border-radius: 0.2rem;
  font-size: 1.2rem;
  line-height: 1.8;
  background: rgba(255, 198, 109, 1);
  border: 2px solid rgb(173, 131, 68);
  font-weight: bold;
  text-transform: uppercase;
  cursor: pointer;

  &:hover {
    transform: scale(1.1);
  }
`;

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
    <PlayerWrapper>
      <div ref={videoContainerRef} style={{ width: "100%", height: "auto" }} />
      <Button type={"button"} onClick={playPause}>
        {playing ? "Pause" : "Play"}
      </Button>
      <Button type={"button"} onClick={() => skip(-10)}>
        Seek -10
      </Button>
      <Button type={"button"} onClick={() => skip(10)}>
        Seek +10
      </Button>
      {renderEvents.map(({ seq, evt, dur }) => (
        <div key={seq}>
          {seq} {evt} {dur}
        </div>
      ))}
    </PlayerWrapper>
  );
};
