import { SIZES } from "@/common/constants";
import { Loader as LoaderComp } from "semantic-ui-react";
import styled from "styled-components";
import { Box } from "../../common/components/custom";

const SLoader = styled(LoaderComp)`
  &::before {
    border-color: ${({ $greyColor }) => $greyColor && "#b2b0b2f5"} !important;
  };
    top: ${({ $marginTop }) => $marginTop && "70%"} !important;

  @media (max-width: 767px) {
    top: ${({ $tableArea }) => $tableArea && "50%"} !important;
  }
`;

export const Loader = ({ children, active, message, $greyColor, $marginTop, $tableArea }) => {
  return (
    <>
      {active ? (
        <Box height="150px">
          <SLoader $marginTop={$marginTop} $tableArea={$tableArea} $greyColor={$greyColor} active size={SIZES.LARGE}>{message && message}</SLoader>
        </Box>
      ) : children}
    </>
  );
};
