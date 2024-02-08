import { Loader as LoaderComp } from "semantic-ui-react";
import styled from "styled-components";

const SLoader = styled(LoaderComp)`
  &::before {
    border-color: ${({ greyColor }) => greyColor && "#b2b0b2f5"} !important;
  };
`;

export const Loader = ({ children, active, message, greyColor }) => {
  return (
    <>
      {active ? <SLoader greyColor={greyColor} active size="large">{message && message}</SLoader> : children}
    </>
  );
};
