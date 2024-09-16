import { useShaka } from "./engine-shaka";
import { useRef } from "react";
import { useNativeEvents } from "./native-events.hook";
import { useFilteredEvents } from "./filtered-events.hook";
import { useRenderEvents } from "./render-events.hook";
import { useControls } from "./controls.hook";

export const Player = ({
  engine,
  videoUrl,
}: {
  engine?: string;
  videoUrl?: string;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useNativeEvents({ videoRef });
  const { playing, seeking, buffering, events, blocked, loading } =
    useFilteredEvents({ videoRef });
  const renderEvents = useRenderEvents(events);

  // TODO extract to useEngine component with switch on selected engine
  useShaka({
    videoRef,
    videoUrl,
  });

  const { playPause, skip } = useControls({
    playing,
    videoRef,
  });

  return (
    <div>
      <video ref={videoRef} style={{ width: "100%", height: "auto" }} />
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
