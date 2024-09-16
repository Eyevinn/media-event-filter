import { useEffect } from "react";
import shaka from "shaka-player";
import hlsjs, { Events } from "hls.js";
import { MediaPlayer, ErrorEvent } from "dashjs";

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

      p.addEventListener("error", console.error);

      // Kill player when unmounted
      return () => p.destroy().catch(() => {});
    }

    if (engine === "hlsjs") {
      const p = new hlsjs({
        // debug: true,
      });

      p.attachMedia(video);
      p.loadSource(videoUrl);
      p.on(Events.ERROR, console.error);

      // Kill player when unmounted
      return () => p.destroy();
    }

    if (engine === "dashjs") {
      const p = MediaPlayer().create();

      p.initialize(video, videoUrl, true);

      p.on("error", console.error);

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
