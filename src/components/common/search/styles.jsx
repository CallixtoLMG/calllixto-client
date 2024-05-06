import { Flex } from "rebass";
import { Search as SSearch } from "semantic-ui-react";
import styled from "styled-components";

const Container = styled(Flex)`
  flex-direction: ${({ flexDir }) => flexDir};
  margin-top: ${({ marginTop }) => marginTop} !important;
  place-content: space-between;
`;

const Search = styled(SSearch)`
  margin: 5px 0 !important;
  box-shadow: 0 1px 2px 0 rgba(34,36,38,.15);
  border-radius: 0.28571429rem;
  height: ${({ height = '50px' }) => `${height}!important`} ;
  input {
    height: ${({ height = '50px' }) => `${height}!important`} ;
  };
  .results {
    width: 300px !important;
  }
`;

const Text = styled.p`
   margin: 0;
`;

export {
  Container, Search, Text
};

