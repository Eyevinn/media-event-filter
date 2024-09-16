import { useEffect } from "react";
import shaka from "shaka-player";
import hlsjs from "hls.js";

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
    if (!videoUrl) return;

    if (engine === "shaka") {
      const p = new shaka.Player(video);

      // Add configuration if needed
      // p.configure();

      p
        // start loading the stream
        .load(videoUrl)
        // catch errors during load
        .catch(console.error);

      // Kill player when unmounted
      return () => p.destroy().catch(() => {});
    }

    if (engine === "hlsjs") {
      const p = new hlsjs({
        // debug: true,
      });

      p.attachMedia(video);
      p.loadSource(videoUrl);

      // Kill player when unmounted
      return () => p.destroy();
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
