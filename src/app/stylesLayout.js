import styled, { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  ::-webkit-scrollbar {
    width: 10px; 
    height: 10px; 
  }

  ::-webkit-scrollbar-track {
    background: #f1f1f1; 
  }

  ::-webkit-scrollbar-thumb {
    background-color: #888; 
    border: 3px solid #f1f1f1; 
  }

  ::-webkit-scrollbar-thumb:hover {
    background-color: #555;  
  }
 
  html {
    scrollbar-width: thin; 
    scrollbar-color: #888 #f1f1f1;
  }

  * {
    scrollbar-width: thin;
    scrollbar-color: #888 #f1f1f1;
  }

  .react-datepicker {
    left: 31px;
  }
`;

const LayoutChildrenContainer = styled.div`
  min-height: 80vh;
`;

export { GlobalStyle, LayoutChildrenContainer };

