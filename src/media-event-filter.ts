export enum FilteredMediaEvent {
  /** Loading of stream is complete, playback is ready to start */
  LOADED = "loaded",
  /** A seek has started */
  SEEKING = "seeking",
  /** A seek has ended  */
  SEEKED = "seeked",
  /** Buffering has started */
  BUFFERING = "buffering",
  /** Buffering has ended */
  BUFFERED = "buffered",
  /** A request to start playing again has been made */
  PLAY = "play",
  /** The stream has started playing after loading completed
   *  OR the stream has started playing after the stream was previously paused */
  PLAYING = "playing",
  /** The stream has been paused */
  PAUSE = "pause",
  /** The end of the stream was reached */
  ENDED = "ended",
  /** A timeupdate event */
  TIME_UPDATE = "timeupdate",
}

type TFilteredMediaEventCallback = (event: FilteredMediaEvent) => void;

type TMediaEventFilterOptions = {
  videoElement: HTMLVideoElement;
  callback: TFilteredMediaEventCallback;
};

type TCallback = () => void;

// https://html.spec.whatwg.org/multipage/media.html#mediaevents
enum MediaEvent {
  loadstart = "loadstart",
  progress = "progress",
  suspend = "suspend",
  abort = "abort",
  error = "error",
  emptied = "emptied",
  stalled = "stalled",
  loadedmetadata = "loadedmetadata",
  loadeddata = "loadeddata",
  canplay = "canplay",
  canplaythrough = "canplaythrough",
  playing = "playing",
  waiting = "waiting",
  seeking = "seeking",
  seeked = "seeked",
  ended = "ended",
  durationchange = "durationchange",
  timeupdate = "timeupdate",
  play = "play",
  pause = "pause",
  ratechange = "ratechange",
  resize = "resize",
  volumechange = "volumechange",
}

type TPlaybackState = {
  loading: boolean;
  buffering: boolean;
  seeking: boolean;
  paused: boolean;
  ended: boolean;
  initialPlayFired: boolean;
  deferLoadedEvent: boolean;
  deferPlayingEvent: boolean;
  deferSeekedEvent: boolean;
  playRequested: boolean;
};

const initialState = {
  paused: false,
  ended: false,
  // true until the video is ready to play, only toggles once
  loading: true,
  // true when the videoElement behavior is interpreted as buffering
  // should not toggle while seeking
  buffering: false,
  // true when the videoElement behavior is interpreted as seeking
  // a seek should cancel buffering
  seeking: false,
  // initial play is different from subsequent plays, because paused is false
  initialPlayFired: false,
  // the defer logic handles player engines that set video.playbackRate
  // to 0 in order to buffer. "playing"/"loading"/"seeking" can trigger
  // while playbackRate is 0, in this case we defer the event until
  // playbackRate returns to a positive value.
  deferLoadedEvent: false,
  deferPlayingEvent: false,
  deferSeekedEvent: false,
  playRequested: false,
};

export type TMediaEventFilter = {
  teardown: TCallback;
};

export const getVideoEventFilter = ({
  videoElement,
  callback,
}: TMediaEventFilterOptions): TMediaEventFilter => {
  let ratechangeBufferTimeout: number | null = null;

  const clearRatechangeBufferTimeout = () => {
    if (typeof ratechangeBufferTimeout === "number") {
      clearTimeout(ratechangeBufferTimeout)
    }
  }

  let state: TPlaybackState = {
    ...initialState,
  };

  const isNotReady = (): boolean => state.loading || state.ended;

  const onCanPlayThrough = (): void => {
    if (!state.loading) {
      // Recover from Safari "mute" micro buffer triggered by "waiting"
      if (state.buffering && videoElement.playbackRate > 0) {
        state = {
          ...state,
          buffering: false,
        };

        callback(FilteredMediaEvent.BUFFERED);
      }
    }

    if (state.loading) {
      // guard for when an engine sets playbackRate to 0 to continue buffering
      // recover in "ratechange" event
      if (videoElement.playbackRate === 0) {
        state = {
          ...state,
          deferLoadedEvent: true,
        };
      } else {
        state = {
          ...state,
          loading: false,
          deferLoadedEvent: false,
        };

        callback(FilteredMediaEvent.LOADED);
      }
    }
  };

  // TODO changing audio track in Shaka causes SEEKING rather than BUFFERING event.
  //  investigate if this is expected.
  const onSeeking = (): void => {
    // playback should be ready before reacting to "seeking" event (e.g. shaka jumps)
    if (isNotReady()) return;

    // end ongoing buffering, this enables trackers to report
    // the buffer duration before starting the seek.
    if (state.buffering) callback(FilteredMediaEvent.BUFFERED);

    state = {
      ...state,
      seeking: true,
      buffering: false,
    };

    callback(FilteredMediaEvent.SEEKING);
  };

  const onSeeked = (): void => {
    // playback should be ready before reacting to "seeked" event (e.g. shaka jumps)
    if (isNotReady()) return;
    // to handle the potential event chain: seeking (not ready) -> loaded (ready) -> seeked
    if (!state.seeking) return;

    // guard for when an engine sets playbackRate to 0 to continue buffering
    // recover in "ratechange" event
    if (videoElement.playbackRate === 0) {
      state = {
        ...state,
        deferSeekedEvent: true,
      };

      return;
    }

    state = {
      ...state,
      seeking: false,
      deferSeekedEvent: false,
    };

    callback(FilteredMediaEvent.SEEKED);
  };

  const onWaiting = (): void => {
    clearRatechangeBufferTimeout();

    // playback should be ready before reacting to "waiting" event
    if (isNotReady()) return;
    // ignore "waiting" while seeking
    if (state.seeking) return;

    // some browsers send "waiting" before the "seeking" event
    if (videoElement.seeking) {
      onSeeking();
      return;
    }

    // ignore "waiting" while already buffering
    if (state.buffering) return;

    state = {
      ...state,
      buffering: true,
    };

    callback(FilteredMediaEvent.BUFFERING);
  };

  const onPlay = (): void => {
    if (isNotReady()) return;

    // enable triggering deferred playing event when toggling play-pause
    // during seeking or buffering
    state = {
      ...state,
      playRequested: true,
    };

    callback(FilteredMediaEvent.PLAY);
  };

  const onPlaying = (): void => {
    clearRatechangeBufferTimeout();

    // guard for when an engine sets playbackRate to 0 to continue buffering
    // recover in "ratechange" event
    if (videoElement.playbackRate === 0) {
      state = {
        ...state,
        deferPlayingEvent: true,
      };

      return;
    }

    state = {
      ...state,
      deferPlayingEvent: false,
    };

    if (state.loading) {
      // when using <video autoplay />, "playing" will trigger before "canplaythrough"
      // force "loaded" event to trigger before "playing" event
      onCanPlayThrough();
    }

    if (!state.initialPlayFired) {
      state = {
        ...state,
        initialPlayFired: true,
        paused: false,
        playRequested: false,
      };

      callback(FilteredMediaEvent.PLAYING);
    } else if (state.buffering) {
      state = {
        ...state,
        buffering: false,
      };

      callback(FilteredMediaEvent.BUFFERED);
    } else if (state.seeking) {
      state = {
        ...state,
        seeking: false,
        deferSeekedEvent: false,
      };

      callback(FilteredMediaEvent.SEEKED);
    }

    if (state.paused && state.playRequested) {
      state = {
        ...state,
        paused: false,
        playRequested: false,
      };

      callback(FilteredMediaEvent.PLAYING);
    }
  };

  const onPause = (): void => {
    state = {
      ...state,
      // always reset play requests
      playRequested: false,
    }

    if (state.paused) return;
    // // potential logic to only propagate "real" pauses. Prevents pause events that are triggered
    // // by an engine due to seeking (might be an issue in Safari).
    // if (videoElement.readyState !== 4) return

    // Safari autoplay block triggers with a deferred loaded event,
    // recover to a paused state
    if (state.deferLoadedEvent) {
      state = {
        ...state,
        loading: false,
        deferLoadedEvent: false,
      };

      callback(FilteredMediaEvent.LOADED);

      if (videoElement.paused) {
        state = {
          ...state,
          paused: true,
        }

        callback(FilteredMediaEvent.PAUSE);
      }
    } else {
      state = {
        ...state,
        paused: true,
      };
    }

    callback(FilteredMediaEvent.PAUSE);
  };

  const shouldTriggerRatechangeBuffer = () =>
    // Not already seeking
    !state.seeking &&
    // Not already buffering
    !state.buffering &&
    // playbackRate is not 0
    videoElement.playbackRate > 0 &&
    // videoElement does not indicate it's seeking
    !videoElement.seeking

  const onRatechange = (): void => {
    clearRatechangeBufferTimeout();

    const playbackRateIsPositive = videoElement.playbackRate > 0;

    // the engine kept buffering after "canplaythrough" event, recover
    if (state.deferLoadedEvent && playbackRateIsPositive) {
      onCanPlayThrough();
    }

    // the engine kept buffering after "playing" event, recover
    if (state.deferPlayingEvent && playbackRateIsPositive) {
      // onPlaying handles if a pause arrived after the playing event was deferred
      onPlaying();
    }

    // the engine kept buffering after "seeked" event, recover
    if (state.deferSeekedEvent && playbackRateIsPositive) {
      onSeeked();
    }

    if (isNotReady()) return;

    // should ratechange be interpreted as a buffering event
    if (shouldTriggerRatechangeBuffer()) {
      ratechangeBufferTimeout = window.setTimeout(() => {
        // shaka sets playbackRate to 0 while buffering, ignore ratechange if
        // already seeking
        //
        // execute on a timeout since shaka can sometimes set playbackRate to 0
        // when a seek is requested, which would trigger buffering right before
        // seeking. A delay of 50ms seems enough to allow the "seeking" event to
        // propagate before interpreting the "ratechange" as buffering.
        //
        // re-check condition because async
        if (shouldTriggerRatechangeBuffer()) {
          onWaiting();
        }
      }, 50);
    }

    // recover from engine buffering
    else if (state.buffering && playbackRateIsPositive) {
      state = {
        ...state,
        buffering: false,
      };

      callback(FilteredMediaEvent.BUFFERED);
    }
  };

  const onEnded = (): void => {
    state = {
      ...state,
      ended: true,
      buffering: false,
      seeking: false,
      loading: false,
      paused: true,
    };

    clearRatechangeBufferTimeout();

    callback(FilteredMediaEvent.ENDED);
  };

  const onTimeupdate = (): void => {
    if (isNotReady()) return;

    callback(FilteredMediaEvent.TIME_UPDATE);
  };

  const EventHandlerPairs: Array<[MediaEvent, TCallback]> = [
    [MediaEvent.canplaythrough, onCanPlayThrough],
    [MediaEvent.playing, onPlaying],
    [MediaEvent.waiting, onWaiting],
    [MediaEvent.seeking, onSeeking],
    [MediaEvent.seeked, onSeeked],
    [MediaEvent.ended, onEnded],
    [MediaEvent.timeupdate, onTimeupdate],
    [MediaEvent.play, onPlay],
    [MediaEvent.pause, onPause],
    [MediaEvent.ratechange, onRatechange],
  ];

  EventHandlerPairs.forEach(([event, handler]) =>
    videoElement.addEventListener(event, handler)
  );

  return {
    teardown: () => {
      clearRatechangeBufferTimeout();

      EventHandlerPairs.forEach(([event, handler]) =>
        videoElement.removeEventListener(event, handler)
      );
    }
  }
};
