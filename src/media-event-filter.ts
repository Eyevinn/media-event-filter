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
  mediaElement: HTMLMediaElement;
  callback: TFilteredMediaEventCallback;
  allowResumeAfterEnded?: boolean;
};

type TCallback = () => void;

// https://html.spec.whatwg.org/multipage/media.html#mediaevents
export enum MediaEvent {
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
  // true when the mediaElement behavior is interpreted as buffering
  // should not toggle while seeking
  buffering: false,
  // true when the mediaElement behavior is interpreted as seeking
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

export const getMediaEventFilter = ({
  mediaElement,
  callback,
  allowResumeAfterEnded = false,
}: TMediaEventFilterOptions): TMediaEventFilter => {
  let ratechangeBufferTimeout: number | null = null;

  const clearRatechangeBufferTimeout = () => {
    if (typeof ratechangeBufferTimeout === "number") {
      clearTimeout(ratechangeBufferTimeout);
    }
  };

  let state: TPlaybackState = {
    ...initialState,
  };

  const reset = (): void => {
    clearRatechangeBufferTimeout();

    state = {
      ...initialState,
    };
  };

  const isNotReady = (): boolean =>
    allowResumeAfterEnded ? state.loading : state.loading || state.ended;

  // Reset state of media event filter when a new src is
  // attached to the media element.
  const onEmptied = (): void => {
    reset();
  };

  const onCanPlayThrough = (): void => {
    if (!state.loading) {
      // Safari triggers "waiting" when muting a stream.
      //
      // This logic recovers from the Safari micro buffer triggered
      // by a mute.
      if (state.buffering && mediaElement.playbackRate > 0) {
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
      if (mediaElement.playbackRate === 0) {
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

  const onSeeking = (): void => {
    // playback should be ready before reacting to "seeking" event (e.g. shaka jumps)
    if (isNotReady()) return;

    // If stream has reached the end and an onSeeking has been triggered we want to set the ended state to false
    // This can only happen if allowResumeAfterEnded is set to true (otherwise isNotReady is true)
    if (state.ended) {
      state.ended = false;
    }

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
    if (mediaElement.playbackRate === 0) {
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

    // Firefox + hls.js will cause a waiting event on reaching EOS
    if (mediaElement.ended) return;
    // playback should be ready before reacting to "waiting" event
    if (isNotReady()) return;
    // ignore "waiting" while seeking
    if (state.seeking) return;

    // some browsers send "waiting" before the "seeking" event
    if (mediaElement.seeking) {
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
    // handle pressing play or seeking back into the video after ended.
    //
    // mediaElement.ended will already have toggled from true to false
    // when this happens, use cached ended state instead.
    if (state.ended) {
      reset();
      return;
    }

    if (isNotReady()) return;

    // block mse plays triggered after buffering and seeks
    if (!state.paused || !state.initialPlayFired) return;

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
    if (mediaElement.playbackRate === 0) {
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
    // playback ending should not trigger a pause event
    if (mediaElement.ended) return;
    // Allow pausing while already paused if a play was requested
    if (!state.playRequested && state.paused) return;

    state = {
      ...state,
      // always reset play requests
      playRequested: false,
    };

    // Safari autoplay block triggers with a deferred loaded event,
    // recover to a paused state
    if (state.deferLoadedEvent) {
      state = {
        ...state,
        loading: false,
        deferLoadedEvent: false,
      };

      callback(FilteredMediaEvent.LOADED);

      if (mediaElement.paused) {
        state = {
          ...state,
          paused: true,
        };

        callback(FilteredMediaEvent.PAUSE);
      }
    } else {
      state = {
        ...state,
        paused: true,
      };

      callback(FilteredMediaEvent.PAUSE);
    }
  };

  const shouldTriggerRatechangeBuffer = () =>
    // Not already seeking
    !state.seeking &&
    // Not already buffering
    !state.buffering &&
    // playbackRate is 0
    mediaElement.playbackRate === 0 &&
    // mediaElement does not indicate it's seeking
    !mediaElement.seeking;

  const onRatechange = (): void => {
    clearRatechangeBufferTimeout();

    // Ignore ratechange if EOS has been reached
    if (mediaElement.ended) return;

    const playbackRateIsPositive = mediaElement.playbackRate > 0;

    // the engine kept buffering after "canplaythrough" event, recover
    if (state.deferLoadedEvent && playbackRateIsPositive) {
      onCanPlayThrough();
    }

    // The engine kept buffering after "seeked" event, recover.
    // Trigger before deferred playing check, since playing can
    // be converted to seeked.
    if (state.deferSeekedEvent && playbackRateIsPositive) {
      onSeeked();
    }

    // the engine kept buffering after "playing" event, recover
    if (state.deferPlayingEvent && playbackRateIsPositive) {
      // onPlaying handles if a pause arrived after the playing event was deferred
      onPlaying();
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

    if (state.buffering && !mediaElement.paused) {
      state = {
        ...state,
        buffering: false,
      };

      callback(FilteredMediaEvent.BUFFERED);
    }

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
    [MediaEvent.emptied, onEmptied],
  ];

  EventHandlerPairs.forEach(([event, handler]) =>
    mediaElement.addEventListener(event, handler),
  );

  return {
    teardown: () => {
      clearRatechangeBufferTimeout();

      EventHandlerPairs.forEach(([event, handler]) =>
        mediaElement.removeEventListener(event, handler),
      );
    },
  };
};
