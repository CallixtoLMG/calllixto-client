import { Grid } from "semantic-ui-react";
import { styled } from "styled-components";

const Text = styled.p`
  display: flex;
  position: relative;
  justify-content: center;
  top: -10px;
  color: #579294;
`;

const ModGrid = styled(Grid)({
  height: '100vh!important',
  background: "#C8E3DF!important",
});

const ModButton = styled.button`
  background-color: #579294;
  color: white;
  width: 100%;
  font-size: 1rem;
  cursor: pointer;
  display: inline-block;
  min-height: 1em;
  border: none;
  color: white;
  margin: 0 0.25em 0 0;
  padding: 0.8em 1.5em 0.8em;
  font-weight: 700;
  line-height: 1em;
  border-radius: 0.3rem;
  transition: opacity .1s ease,background-color .1s ease,color .1s ease,box-shadow .1s ease,background .1s ease;

  &:hover {
    background-color: #369294;
  }

  &:active {
    background-color: #347C7D;
  }
`;

const ModGridColumn = styled(Grid.Column)({
  maxWidth: '450px!important',
});

export { ModButton, ModGrid, ModGridColumn, Text };

