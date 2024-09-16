import { RefObject, useEffect } from "react";
import shaka from "shaka-player";

export const useShaka = ({
  videoUrl,
  videoRef,
}: {
  videoUrl: string;
  videoRef: RefObject<HTMLVideoElement>;
}) => {
  useEffect(() => {
    if (!videoUrl || !videoRef.current) return () => {};

    const player = new shaka.Player(videoRef.current);

    // Add configuration if needed
    // player.configure()

    player
      // start loading the stream
      .load(videoUrl)
      .then(() => {
        videoRef.current?.play();
      })
      // catch errors during load
      .catch(console.error);

    // Kill player when unmounted
    return () => {
      player.destroy().catch(() => {});
    };
  }, [videoUrl, videoRef.current]);
};
