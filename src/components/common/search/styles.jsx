import { Flex } from '@/components/common/custom';
import { Label as SLabel, Search as SSearch } from "semantic-ui-react";
import styled from "styled-components";

const Container = styled(Flex)`
  flex-direction: ${({ flexDir }) => flexDir};
  margin-top: ${({ marginTop }) => marginTop} !important;
  place-content: space-between;
`;

const Search = styled(SSearch)`
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
div.content{
    width: 100%!important;
  }
`;

const Text = styled.p`
   margin: 0;
`;

const Label = styled(SLabel)`
  width: fit-content!important;
  margin-top:2px!important;
`;

export {
  Container, Label, Search, Text
};

