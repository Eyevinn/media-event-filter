import { useEffect } from "react";
import { MediaEvent } from "../media-event-filter";

export const useNativeEvents = ({ video }: { video: HTMLVideoElement }) => {
  useEffect(() => {
    const listeners: [MediaEvent, () => void][] = Object.values(MediaEvent)
      .map((evt) => {
        const pair: [MediaEvent, () => void] = [
          evt,
          () => {
            const mediaElState = {
              networkState: video.networkState,
              readyState: video.readyState,
              paused: video.paused,
              ended: video.ended,
              error: video.error,
              currentTime: video.currentTime,
              duration: video.duration,
              seeking: video.seeking,
            };

            console[evt === MediaEvent.timeupdate ? "debug" : "log"](
              "%cNativeEv: %s",
              "color:#cf1313;font-weight:bold;",
              evt,
            );

            console[evt === MediaEvent.timeupdate ? "debug" : "info"](
              "Media Element State",
              mediaElState,
            );
          },
        ];

        video.addEventListener(evt, pair[1]);

        return pair;
      })
      .filter((v) => !!v);

    return () => {
      listeners.forEach(([evt, listener]) => {
        video.removeEventListener(evt, listener);
      });
    };
  }, [video]);
};
