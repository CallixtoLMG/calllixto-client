import { Flex } from "rebass";
import { Button, Form, Input, Label } from "semantic-ui-react";
import styled from "styled-components";

const MainContainer = styled(Flex)`
  margin: 75px 30px 30px 30px!important;
  flex-direction: column;
`;

const ModButton = styled(Button)({
  width: "170px!important",
  padding: "10px 0!important",
});

const ModLabel = styled(Label)({
  maxWidth: "50vh!important",
  width: "100%!important"
});

const ModInput = styled(Input)`
  margin: 1rem 0!important;
  box-shadow: 0 1px 2px 0 rgba(34,36,38,.15);
  border-radius: 0.28571429rem;
  height: 50px!important;
  
  > input  {
    padding: 1em 1em!important;
  }
`;

const ModFormField = styled(Form.Field)({
  margin: "0!important",
  maxWidth: "50vh!important",

});

const WarningMessage = styled.p`
  margin-left: 5px!important;
  color: red;
`;

export { MainContainer, ModButton, ModFormField, ModInput, ModLabel, WarningMessage };

