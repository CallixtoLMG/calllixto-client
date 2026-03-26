import { Search as SSearch } from "semantic-ui-react";
import styled from "styled-components";

const Search = styled(SSearch)`
  width: ${({ $width }) => $width};
  min-width: ${({ $minWidth }) => $minWidth}!important;
  max-width: ${({ $maxWidth }) => $maxWidth}!important;

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
  };
  
  &&& input{
    padding-right :9.5px!important;
  };
`;

const Text = styled.p`
   margin: 0;
   display: inline;
`;

export {
  Search, Text
};

