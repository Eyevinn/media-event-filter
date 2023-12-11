# Media Event Filter

A small package for producing a sane default interpretation of commonly used playback events from a [HTMLVideoElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement).

## Why

The HTML5 video element does not produce a consistent set of events that correspond to the updates required by trackers and user interfaces, like `loaded`, `buffering` or `seeking`.

Different player engines built on top of the Media Source Extension all have their own implementations for listening to events.

This filter aims to provide a single source of truth that can be used across player engines and browser native playback.

Adheres to the [Eyevinn Player Analytics Specification](https://github.com/Eyevinn/player-analytics-specification).

## Limitations

Does not support native HTML5 MSE controls (`<video controls>`). It works, but event sequence will not strictly follow EPAS in all browsers.

Does not support re-using the same video element.

## Usage

`npm install @eyevinn/media-event-filter`

`yarn add @eyevinn/media-event-filter`

Example of creating and listening to the event filter.

```typescript
import {
  getMediaEventFilter,
  FilteredMediaEvent,
} from "@eyevinn/media-event-filter";

const videoElement = document.createElement("video");

// Using a switch statement

const mediaEventFilter = getMediaEventFilter({
  videoElement,
  callback: (event: FilteredMediaEvent) => {
    switch (event) {
      case FilteredMediaEvent.LOADED:
        // handle loaded
        break;
      case FilteredMediaEvent.BUFFERING:
        // handle buffering
        break;
      case FilteredMediaEvent.BUFFERED:
      // handle buffered
      // ...
      default:
        break;
    }
  },
});

// Call when done
mediaEventFilter.teardown();
```

```typescript
// Object notation can also be used

const handlers = {
  [FilteredMediaEvent.LOADED]: () => {
    /* handle loaded */
  },
  [FilteredMediaEvent.BUFFERING]: () => {
    /* handle buffering */
  },
  [FilteredMediaEvent.BUFFERED]: () => {
    /* handle buffered */
  },
  // ...
};

const mediaEventFilter = getMediaEventFilter({
  videoElement,
  callback: (event: FilteredMediaEvent) => handlers[event]?.(),
});
```

```typescript
// It is safe to use destructuring

const { teardown } = getMediaEventFilter({
  /* ... */
});

teardown();
```

### Sample Shaka + React Component

The filter can be used to easily build a React UI on top of Shaka.

A barebones sample integration (see it on [codepen](https://codepen.io/atlimar/pen/wvEmpXM?editors=1010)):

```javascript
import { useCallback, useEffect, useMemo, useRef, useState } from "React";
import shaka from "shaka-player";
import {
  FilteredMediaEvent,
  getMediaEventFilter,
} from "@eyevinn/media-event-filter";

const PlayerComponent = ({ videoUrl }) => {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    if (!videoUrl || !videoRef.current) return () => {};

    const eventFilter = getMediaEventFilter({
      videoElement: videoRef.current,
      // add your state handlers here
      callback: (event) => {
        switch (event) {
          case FilteredMediaEvent.LOADED:
            setLoading(false);

            // attempt autoplay
            videoRef.current.play().catch((e) => {
              // catch autoplay block
              if (e.name.indexOf("NotAllowedError") > -1) {
                setBlocked(true);
              }
            });
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
          default:
            break;
        }
      },
    });

    const player = new shaka.Player(videoRef.current);

    // Add configuration if needed
    // player.configure()

    player
      // start loading the stream
      .load(videoUrl)
      // catch errors during load
      .catch(console.error);

    // Kill player when unmounted
    return () => {
      player.destroy();
      eventFilter.teardown();
    };
  }, [videoUrl, videoRef]);

  const play = useCallback(() => {
    if (!videoRef.current) return;

    videoRef.current.play();
  }, [videoRef]);

  const pause = useCallback(() => {
    if (!videoRef.current) return;

    videoRef.current.pause();
  }, [videoRef]);

  return (
    <div style={{ width: "720px", margin: "20px auto" }}>
      {loading && <p>Video is Loading</p>}

      {!loading &&
        (playing ? (
          <button type="button" onClick={pause}>
            Pause
          </button>
        ) : (
          <button type="button" onClick={play}>
            Play
          </button>
        ))}

      {blocked && <p>Autoplay blocked, please start playback manually</p>}

      <video ref={videoRef} style={{ width: "100%", height: "auto" }} />
    </div>
  );
};
```

```javascript
// Use it:
<PlayerComponent videoUrl="https://bitmovin-a.akamaihd.net/content/MI201109210084_1/mpds/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.mpd" />
```

## Benefits

Get a single source of truth for playback events regardless of engine (Shaka, Hls.js, DashJS, native) or browser (Chrome, Firefox, Safari).

Pipe the events directly into your UI state management for a reliable source of truth of playback state updates.

The event sequence map directly to popular tracking providers and playback SDKs without further filtering, like Youbora, Comscore, Yospace, or Nielsen. _If yours is also supported we welcome PRs to update this list!_

Compatible with [EPAS](https://github.com/Eyevinn/player-analytics-specification).

## Events

A description of events and their sequencing.

### Example Sequences

```typescript
LOADED; // playback is ready to start
PLAYING; // playback started
SEEKING; // seek requested
PAUSED; // manual pause
PLAY; // manual play
SEEKED; // seek finished
PLAYING; // video is rolling again
BUFFERING; // unable to continue playing due to missing buffer
BUFFERED; // buffer ended by incoming seek request
SEEKING; // seek requested
SEEKED; // seek finished
PAUSED; // manual pause
PLAY; // manual play
PLAYING; // video is rolling again
ENDED; // video reached the end
```

### loaded

The initial load of the video has completed, and it is ready to start playing.

No other event can trigger before loaded.

### seeking

Seeking has started.

If buffering is ongoing buffered will be triggered prior to seeking.

Buffer events can not trigger during a seek.

Can not trigger before loaded.

### seeked

Seeking has ended.

Can not trigger before loaded.

Can not trigger without a preceding seeking event.

### buffering

Buffering has started.

Can not trigger during a seek.

Can not trigger before loaded.

### buffered

Buffering has ended, or was interrupted by a seek.

Can not trigger during a seek.

Can not trigger without a preceding buffering event.

### play

Playback has been requested.

Can not trigger before loaded.

Can not trigger if video was not previously paused.

### playing

Playback has started.

Can not trigger before loaded.

Can not trigger during seeking.

Can not trigger during buffering.

Can not trigger if video was not previously paused.

A play requested during seeking or buffering will trigger playing after the seek or buffer has finished.

### pause

Playback has been paused.

Seeking or buffering do not count as pausing.

Can not trigger before loaded.

### timeupdate

A timeupdate event

Can not trigger before loaded.

### ended

The player has reached the end of a stream.

To allow restarting the stream after the end of stream has been reached set `allowResumeAfterEnded` to `true`.

## Contributing

Contributions to improve compatibility with or add support for different engines, tracking solutions, and browsers are welcome.

### Git Ways of Working

The project uses feature branches, and a [rebase merge strategy](https://www.atlassian.com/git/tutorials/merging-vs-rebasing).

Make sure you have `git pull` set to rebase mode:

`git config pull.rebase true`

Optionally, you can add the `--global` flag to the above command.

To start working on a new feature: `git checkout <feature branch name>`.

As the project uses semantic-release to **automatically generate release notes** based on commits, it is important to follow some rules when committing.

This project uses [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/#summary).

Read [Using Git with Discipline](https://drewdevault.com/2019/02/25/Using-git-with-discipline.html).

Read [How to Write a Commit Message](https://chris.beams.io/posts/git-commit/).

A commit should:

- contain a single change set (smaller commits are better)
- pass tests, linting, and typescript checks
- not be broken

Along with enabling time saving automation, it enables extremely powerful debug workflows via [git bisect](https://git-scm.com/docs/git-bisect), making bug hunting a matter of minutes instead of days. There are a number of articles out there on the magic of bisecting.

Basic structure of a commit message:

```
<type>[optional scope]: <title starting with verb in infinitive>

[optional body]

[optional footer]
```

For automated release notes to work well, try to describe what was added or changed, instead of describing what the code does. Example:

`fix(seek): rewrite calculation in seek module` `// bad, the consumer does not know what issue this fixes`

`fix(seek): stop player from freezing after seek` `// good, the consumer understands what is now working again`

### Develop

To start a dev server: `yarn dev`, check `public/index.html` for details.

Familiarity with the HTML5 video standard, shaka, hlsjs, or other engines
is recommended before contributing.

https://www.w3.org/TR/2011/WD-html5-20110113/video.html

https://html.spec.whatwg.org/multipage/media.html

https://html.spec.whatwg.org/multipage/media.html#mediaevents

Tested with shaka 2.5.X - 4.X.X

Tested with native video in Safari

Tested with hls.js

Tested on Safari 13.1+, Firefox, Chrome, Edge

Tested on OSX, Windows, Linux

### Releasing

Releases are triggered via a github action that will automatically increment the version and write a changelog based on commits.

Manual releases can be made by running `yarn release`.

# Support

Join our [community on Slack](http://slack.streamingtech.se) where you can post any questions regarding any of our open source projects. Eyevinn's consulting business can also offer you:

- Further development of this component
- Customization and integration of this component into your platform
- Support and maintenance agreement

Contact [sales@eyevinn.se](mailto:sales@eyevinn.se) if you are interested.

# About Eyevinn Technology

[Eyevinn Technology](https://www.eyevinntechnology.se) is an independent consultant firm specialized in video and streaming. Independent in a way that we are not commercially tied to any platform or technology vendor. As our way to innovate and push the industry forward we develop proof-of-concepts and tools. The things we learn and the code we write we share with the industry in [blogs](https://dev.to/video) and by open sourcing the code we have written.

Want to know more about Eyevinn and how it is to work here. Contact us at work@eyevinn.se!
