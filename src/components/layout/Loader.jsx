import { Loader as LoaderComp } from "semantic-ui-react";
import styled from "styled-components";
import { Box } from "../common/custom";

const SLoader = styled(LoaderComp)`
  &::before {
    border-color: ${({ $greyColor }) => $greyColor && "#b2b0b2f5"} !important;
  };
`;

export const Loader = ({ children, active, message, $greyColor }) => {
  return (
    <>
      {active ? (
        <Box height="150px">
          <SLoader $greyColor active size="large">{message && message}</SLoader>
        </Box>
      ) : children}
    </>
  );
};
