import { RefObject, useEffect, useState } from "react";
import { FilteredMediaEvent, getMediaEventFilter } from "../media-event-filter";

export const useFilteredEvents = ({ video }: { video: HTMLVideoElement }) => {
  const [playing, setPlaying] = useState(false);
  const [seeking, setSeeking] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [loading, setLoading] = useState(true);
  const [blocked, setBlocked] = useState(false);
  const [events, setEvents] = useState<{ e: FilteredMediaEvent; t: number }[]>(
    [],
  );

  useEffect(() => {
    let seekOrBufferTimestamp = 0;

    const mef = getMediaEventFilter({
      mediaElement: video,
      callback: (evt) => {
        if (!video) return;

        const now = Date.now();

        switch (evt) {
          case FilteredMediaEvent.LOADED:
            setLoading(false);

            // attempt autoplay
            video.play().catch((e) => {
              // catch autoplay block
              if (e.name.indexOf("NotAllowedError") > -1) {
                setBlocked(true);
              }
            });
            break;
          case FilteredMediaEvent.PLAY:
            break;
          case FilteredMediaEvent.PLAYING:
            // reset autplay blocked
            setBlocked(false);
            // we're playing!
            setPlaying(true);
            break;
          case FilteredMediaEvent.ENDED:
          case FilteredMediaEvent.PAUSE:
            setPlaying(false);
            break;
          case FilteredMediaEvent.BUFFERING:
            setBuffering(true);
          case FilteredMediaEvent.BUFFERED:
            setBuffering(false);
          case FilteredMediaEvent.SEEKING:
            setSeeking(true);
            break;
          case FilteredMediaEvent.SEEKED:
            setSeeking(false);
            break;
          case FilteredMediaEvent.TIME_UPDATE:
          default:
            break;
        }

        if (evt === FilteredMediaEvent.TIME_UPDATE) {
          console.debug(
            "%cFiltered: %s",
            "color:#267dff;font-weight:bold;",
            evt,
          );
          return;
        }

        if (
          [FilteredMediaEvent.BUFFERING, FilteredMediaEvent.SEEKING].includes(
            evt,
          )
        ) {
          seekOrBufferTimestamp = now;
        }

        if (
          [FilteredMediaEvent.BUFFERED, FilteredMediaEvent.SEEKED].includes(evt)
        ) {
          console.log(
            "%cFiltered: %s",
            "color:#267dff;font-weight:bold;",
            // TODO it does not work to use seekOrBufferTimestamp inside
            //  the callback. Need to set up separate effect.
            `${evt} (${(now - seekOrBufferTimestamp) / 1000}s)`,
          );
          console.info("\n");
        } else {
          console.log("%cFiltered: %s", "color:#267dff;font-weight:bold;", evt);
          console.info("\n");
        }

        setEvents((prev) => [...prev, { e: evt, t: now }]);
      },
    });

    return () => {
      mef.teardown();
    };
  }, [video]);

  return {
    playing,
    seeking,
    buffering,
    loading,
    blocked,
    events,
  };
};
