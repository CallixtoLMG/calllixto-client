import { Grid, Header } from "semantic-ui-react";
import { styled } from "styled-components";

const MessageText = styled.p`
  display: flex;
  font-size: 12px;
  margin: 0!important;
  color: #579294;
`;

const ModGrid = styled(Grid)`
  &&& {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
  };
`;

const ModGridColumn = styled(Grid.Column)({
  maxWidth: '450px!important',
});

const ModHeader = styled(Header)({
  textAlign: 'center!important'
});

export { MessageText, ModGrid, ModGridColumn, ModHeader };

