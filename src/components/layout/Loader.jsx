import { Loader as LoaderComp } from "semantic-ui-react";
import styled from "styled-components";

const SLoader = styled(LoaderComp)`
  &::before {
    border-color: ${({ grayColor }) => grayColor && "#b2b0b2f5"} !important;
  };
`;

export const Loader = ({ children, active, message, grayColor }) => {
  return (
    <>
      {active ? <SLoader grayColor={grayColor} active size="large">{message && message}</SLoader> : children}
    </>
  );
};
