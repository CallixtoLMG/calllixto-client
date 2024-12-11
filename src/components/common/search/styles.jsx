import { Search as SSearch } from "semantic-ui-react";
import styled from "styled-components";

const Search = styled(SSearch)`
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

      div.content{
        height: 100%;
        display:flex;
        flex-direction: column;
        justify-content: space-between;
        width: 100%;
      }
    };
  };
`;

const Text = styled.p`
   margin: 0;
`;

export {
  Search, Text
};

