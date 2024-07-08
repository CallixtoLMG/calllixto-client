import { Search as SSearch } from "semantic-ui-react";
import styled from "styled-components";
import { Flex } from '@/components/common/custom';

const Container = styled(Flex)`
  flex-direction: ${({ flexDir }) => flexDir};
  margin-top: ${({ marginTop }) => marginTop} !important;
  place-content: space-between;
`;

const Search = styled(SSearch)`
  margin-top: 5px !important;
  box-shadow: 0 1px 2px 0 rgba(34,36,38,.15);
  border-radius: 0.28571429rem;
  height: ${({ height = '50px' }) => `${height}!important`} ;
  input {
    height: ${({ height = '50px' }) => `${height}!important`} ;
  };
  div.results.transition.visible {
    width: 80vw !important;
    display: grid!important;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: auto;
    gap: 8px;
    padding: 8px;
    div.result {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      padding: 10px;
      border: 1px solid rgba(34,36,38,.15)!important;
      border-radius: 0.28571429rem!important;
    };
  };
`;

const Text = styled.p`
   margin: 0;
`;

export {
  Container, Search, Text
};

