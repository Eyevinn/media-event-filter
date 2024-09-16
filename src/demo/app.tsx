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
    <>
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
            {[
              "https://testcontent.eyevinn.technology/mp4/VINN.mp4",
              "https://testcontent.eyevinn.technology/mp4/stswe-tvplus-promo.mp4",
            ].map((src) => (
              <option key={src} value={src}>
                {src}
              </option>
            ))}
          </FormSelect>
        </FormLabel>
      </FormContainer>

      <div>
        Selected engine: {engine} {asset}
      </div>

      <Player engine={engine} videoUrl={asset} />
    </>
  );
};
