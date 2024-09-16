import { useEffect } from "react";
import shaka from "shaka-player";

export const useEngine = ({
  videoUrl,
  video,
  engine,
}: {
  videoUrl?: string;
  video: HTMLVideoElement;
  engine?: string;
}) => {
  useEffect(() => {
    if (!videoUrl) return () => {};

    if (engine === "shaka") {
      const player = new shaka.Player(video);

      // Add configuration if needed
      // player.configure()

      player
        // start loading the stream
        .load(videoUrl)
        .then(() => {
          video.play();
        })
        // catch errors during load
        .catch(console.error);

      // Kill player when unmounted
      return () => {
        player.destroy().catch(() => {});
      };
    }

    if (engine === "hlsjs") {
    }

    if (engine === "native") {
      video.controls = true;
      video.src = videoUrl;

      return () => {
        video.controls = false;
        video.src = "";
        video.load();
      };
    }
  }, [videoUrl, video, engine]);
};
