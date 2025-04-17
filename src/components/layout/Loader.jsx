import { Loader as LoaderComp } from "semantic-ui-react";
import styled from "styled-components";
import { Box } from "../../common/components/custom";

const SLoader = styled(LoaderComp)`
  &::before {
    border-color: ${({ $greyColor }) => $greyColor && "#b2b0b2f5"} !important;
  };
    top: ${({ $marginTop }) => $marginTop && "70%"} !important;
`;

export const Loader = ({ children, active, message, $greyColor, $marginTop }) => {
  return (
    <>
      {active ? (
        <Box height="150px">
          <SLoader $marginTop={$marginTop} $greyColor={$greyColor} active size="large">{message && message}</SLoader>
        </Box>
      ) : children}
    </>
  );
};
