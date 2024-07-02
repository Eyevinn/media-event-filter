# [2.2.0](https://github.com/Eyevinn/media-event-filter/compare/v2.1.0...v2.2.0) (2024-07-02)


### Features

* enable reuse of MediaElement ([8f0dd2b](https://github.com/Eyevinn/media-event-filter/commit/8f0dd2b8df0ebcec5417e9b99b9a870881578bfc))

# [2.1.0](https://github.com/Eyevinn/media-event-filter/compare/v2.0.0...v2.1.0) (2024-06-28)


### Features

* prevent buffering at end of stream ([a397518](https://github.com/Eyevinn/media-event-filter/commit/a39751843a62c9d9019c48643400e50cbd49c921))

# [2.0.0](https://github.com/Eyevinn/media-event-filter/compare/v1.0.4...v2.0.0) (2024-04-02)


### Bug Fixes

* bump workflow node dep to 20.x, required by semantic-release ([8f1ea26](https://github.com/Eyevinn/media-event-filter/commit/8f1ea26bea40e38a9966072db2f3d9a224d400c3))
* update yarn deps ([ccedbdc](https://github.com/Eyevinn/media-event-filter/commit/ccedbdc0951fb831b8dc30f63e45553aa3729be8))


* feat!: allow using any HTMLMediaElement ([5b502e9](https://github.com/Eyevinn/media-event-filter/commit/5b502e9f17dccba03606b47a32b929bdc2395d93))


### BREAKING CHANGES

* videoElement argument renamed to mediaElement

OLD: getMediaEventFilter({ videoElement });
NEW: getMediaEventFilter({ mediaElement });

## [1.0.4](https://github.com/Eyevinn/media-event-filter/compare/v1.0.3...v1.0.4) (2023-12-15)


### Bug Fixes

* allow seeking after a stream has reached the end ([e5fe405](https://github.com/Eyevinn/media-event-filter/commit/e5fe405cd1319c8f696cd0c85f711cccf8e634c3))
* mark as side effect free ([6e2c307](https://github.com/Eyevinn/media-event-filter/commit/6e2c307062a29aafed37a0c6ef46c6fa5af950cb))

## [1.0.3](https://github.com/Eyevinn/media-event-filter/compare/v1.0.2...v1.0.3) (2023-03-24)


### Bug Fixes

* playback ending dispatches `pause` then `ended` ([5369a5f](https://github.com/Eyevinn/media-event-filter/commit/5369a5fbc646f204a361aa4f36cfecec8dfe1d24))

## [1.0.2](https://github.com/Eyevinn/media-event-filter/compare/v1.0.1...v1.0.2) (2023-03-02)


### Bug Fixes

* allow pausing after every play request ([ddbbb44](https://github.com/Eyevinn/media-event-filter/commit/ddbbb44b02cd6322426e5e2ffaa44d4d4847f800))

## [1.0.1](https://github.com/Eyevinn/media-event-filter/compare/v1.0.0...v1.0.1) (2023-03-02)


### Bug Fixes

* propagate pauses during seek and buffers ([516780a](https://github.com/Eyevinn/media-event-filter/commit/516780a125fc70f6cec4a5a4205aa850f89313cc))

# 1.0.0 (2023-03-02)


### Bug Fixes

* clear timeout on ended ([3a2e20b](https://github.com/Eyevinn/media-event-filter/commit/3a2e20b66e07b0f84b306b0d774c73a0991a1a7f))
* end buffering on timeupdate ([cdccc5f](https://github.com/Eyevinn/media-event-filter/commit/cdccc5f63da906c58b72428af093f7443094e4f0))
* rename method ([c4253c8](https://github.com/Eyevinn/media-event-filter/commit/c4253c8a90c9e8184477d9bea026d66d79a9ad77))
* update behaviour around native mse seeks ([adcd0f4](https://github.com/Eyevinn/media-event-filter/commit/adcd0f48063cd5249c6ffc0bd32d2caf5d31e83f))
* update buffering logic ([837f443](https://github.com/Eyevinn/media-event-filter/commit/837f44354d8ec82cccfde2c9822e17dde4e2e7dd))


### Features

* add PLAY event ([98ac627](https://github.com/Eyevinn/media-event-filter/commit/98ac6271b5cdd4a7884fbf45b8f0fc371abe1d33))
* add source code and readme ([6153d02](https://github.com/Eyevinn/media-event-filter/commit/6153d02b3736a6d30735bd04e31717cfae4d9920))
* expose MediaEvent enum ([3393d33](https://github.com/Eyevinn/media-event-filter/commit/3393d339bf20d97f4bd1a5d23e86794c03823b99))
