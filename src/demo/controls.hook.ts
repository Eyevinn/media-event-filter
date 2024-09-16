import { RefObject, useCallback } from "react";

export const useControls = ({
  playing,
  videoRef,
}: {
  playing: boolean;
  videoRef: RefObject<HTMLVideoElement>;
}) => {
  const playPause = useCallback(() => {
    if (playing) videoRef.current?.pause();
    if (!playing) videoRef.current?.play().catch(console.error);
  }, [videoRef.current, playing]);

  const skip = useCallback(
    (num: number) => {
      if (!videoRef.current) return;

      videoRef.current.currentTime = videoRef.current.currentTime + num;
    },
    [videoRef.current, playing],
  );

  return {
    playPause,
    skip,
  };
};
