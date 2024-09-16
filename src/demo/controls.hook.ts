import { useCallback } from "react";

export const useControls = ({
  playing,
  video,
}: {
  playing: boolean;
  video: HTMLVideoElement;
}) => {
  const playPause = useCallback(() => {
    if (playing) video.pause();
    if (!playing) video.play().catch(console.error);
  }, [video, playing]);

  const skip = useCallback(
    (num: number) => {
      if (!video) return;

      video.currentTime = video.currentTime + num;
    },
    [video, playing],
  );

  return {
    playPause,
    skip,
  };
};
