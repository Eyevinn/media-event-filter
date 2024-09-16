import styled from "@emotion/styled";

export const FormContainer = styled.form`
  padding: 2rem;
`;

const sharedMargin = `margin: 0 0 2rem`;

export const FormInput = styled.input`
  width: 100%;
  font-size: 1.6rem;
  padding: 0.5rem;
  margin: 0 0 2rem;
  border: 0.1rem solid #6f6e6e;
  border-radius: 0.5rem;

  ${sharedMargin};

  &.additional-line {
    padding-right: 3.5rem;
  }

  &.with-loader {
    padding-right: 3.5rem;

    &::-webkit-inner-spin-button {
      appearance: none;
    }

    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    &[type="number"] {
      -moz-appearance: textfield;
    }
  }
`;

export const FormSelect = styled.select`
  width: 100%;
  font-size: 1.6rem;
  padding: 0.5rem;
  ${sharedMargin};

  border: 1px solid #6f6e6e;
  border-radius: 0.5rem;
`;

export const FormLabel = styled.label`
  display: block;
  input,
  select {
    font-size: 1.6rem;
    display: inline-block;
  }
`;

export const DecorativeLabel = styled.span`
  display: block;
  white-space: nowrap;
  padding: 0 1rem 1rem 0;
`;

export const StyledWarningMessage = styled.div`
  padding: 0.5rem;
  font-size: 1.6rem;
  background: #ebca6a;
  border-radius: 0.5rem;
  color: #1a1a1a;
  ${sharedMargin};
  border: 1px solid #ebca6a;
  display: flex;
  align-items: center;
`;
