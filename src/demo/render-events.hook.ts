import { useEffect, useState } from "react";
import { FilteredMediaEvent } from "../media-event-filter";

export const useRenderEvents = (
  events: { e: FilteredMediaEvent; t: number }[],
) => {
  const [eventsForRendering, setEventsForRendering] = useState<
    { seq: number; evt: FilteredMediaEvent; dur: number | null }[]
  >([]);

  useEffect(() => {
    setEventsForRendering(() => {
      const mut = {
        seekOrBufferTimestamp: 0,
        dur: 0,
      };

      return events
        .map(({ e, t }, i) => {
          if (
            [FilteredMediaEvent.BUFFERING, FilteredMediaEvent.SEEKING].includes(
              e,
            )
          ) {
            mut.seekOrBufferTimestamp = t;
          }

          if (
            [FilteredMediaEvent.BUFFERED, FilteredMediaEvent.SEEKED].includes(e)
          ) {
            mut.dur = t - mut.seekOrBufferTimestamp;
          }

          return {
            evt: e,
            seq: i,
            dur:
              mut.seekOrBufferTimestamp &&
              [FilteredMediaEvent.BUFFERED, FilteredMediaEvent.SEEKED].includes(
                e,
              )
                ? mut.dur / 1000
                : null,
          };
        })
        .toReversed();
    });
  }, [events]);

  return eventsForRendering;
};
