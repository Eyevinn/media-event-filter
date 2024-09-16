import styled from "@emotion/styled";
import { Global } from "@emotion/react";
import { resetStyles, defaultStyles } from "./css-global";
import { useForm, useWatch } from "react-hook-form";
import {
  DecorativeLabel,
  FormContainer,
  FormLabel,
  FormSelect,
} from "./form-elements";
import { Player } from "./player";

type FormValues = {
  engine: "shaka" | "hlsjs" | "native";
  asset: string;
};

const assets = [
  ["MP4 1", "https://testcontent.eyevinn.technology/mp4/VINN.mp4"],
  [
    "MP4 2",
    "https://testcontent.eyevinn.technology/mp4/stswe-tvplus-promo.mp4",
  ],
  [
    "VOD DASH fMP4",
    "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.mpd",
  ],
  [
    "VOD HLS fMP4",
    "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
  ],
  [
    "HLS LIVE",
    "https://demo.unified-streaming.com/k8s/live/stable/live.isml/.m3u8",
  ],
  [
    "HLS LIVE TIMESHIFT 300s",
    "https://demo.unified-streaming.com/k8s/live/stable/live.isml/.m3u8?time_shift=300",
  ],
  [
    "DASH LIVE",
    "https://demo.unified-streaming.com/k8s/live/stable/live.isml/.mpd",
  ],
  [
    "DASH LIVE TIMESHIFT 300s",
    "https://demo.unified-streaming.com/k8s/live/stable/live.isml/.mpd?time_shift=300",
  ],
  // ["", ""],
  // ["", ""],
];

const Wrapper = styled.div`
  margin: 1rem 1rem 0;
`;

export const App = () => {
  const { register, control } = useForm<FormValues>({
    defaultValues: {
      engine: "native",
      asset: "",
    },
    resetOptions: {
      keepDirtyValues: true, // user-interacted input will be retained
      keepErrors: true, // input errors will be retained with value update
    },
  });

  const { engine, asset } = useWatch<FormValues>({ control });

  return (
    <Wrapper>
      <Global
        styles={`
        ${resetStyles}
        ${defaultStyles}
      `}
      />
      <FormContainer>
        <FormLabel>
          <DecorativeLabel>Engine</DecorativeLabel>
          <FormSelect
            // eslint-disable-next-line
            {...register(`engine`)}
          >
            {["shaka", "hlsjs", "native"].map((engine) => (
              <option key={engine} value={engine}>
                {engine}
              </option>
            ))}
          </FormSelect>
        </FormLabel>
        <FormLabel>
          <DecorativeLabel>Asset</DecorativeLabel>
          <FormSelect
            // eslint-disable-next-line
            {...register(`asset`)}
          >
            {assets.map(([name, src]) => (
              <option key={src} value={src}>
                {name}
              </option>
            ))}
          </FormSelect>
        </FormLabel>
      </FormContainer>

      <Player engine={engine} videoUrl={asset} />
    </Wrapper>
  );
};
