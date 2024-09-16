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

const Select = styled.select``;
const Option = styled.option``;

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
            {["1", "2", "3"].map((engine) => (
              <option key={engine} value={engine}>
                {engine}
              </option>
            ))}
          </FormSelect>
        </FormLabel>
      </FormContainer>

      <div>
        Selected engine: {engine} {asset}
      </div>

      <Player />
    </>
  );
};
