import { RefObject, useEffect } from "react";
import { MediaEvent } from "../media-event-filter";

export const useNativeEvents = ({
  videoRef,
}: {
  videoRef: RefObject<HTMLVideoElement>;
}) => {
  useEffect(() => {
    if (!videoRef.current) return;

    const listeners: [MediaEvent, () => void][] = Object.values(MediaEvent)
      .map((evt) => {
        if (!videoRef.current) return;

        const pair: [MediaEvent, () => void] = [
          evt,
          () => {
            if (!videoRef.current) return;

            const mediaElState = {
              networkState: videoRef.current.networkState,
              readyState: videoRef.current.readyState,
              paused: videoRef.current.paused,
              ended: videoRef.current.ended,
              error: videoRef.current.error,
              currentTime: videoRef.current.currentTime,
              duration: videoRef.current.duration,
              seeking: videoRef.current.seeking,
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

        videoRef.current.addEventListener(evt, pair[1]);

        return pair;
      })
      .filter((v) => !!v);

    return () => {
      listeners.forEach(([evt, listener]) => {
        videoRef.current?.removeEventListener(evt, listener);
      });
    };
  }, [videoRef.current]);
};
