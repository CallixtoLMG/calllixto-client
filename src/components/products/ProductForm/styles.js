import { Flex } from "rebass";
import { Button, Form, Input, Label } from "semantic-ui-react";
import styled from "styled-components";

const ModButton = styled(Button)`
  width: 170px!important;
  padding: 10px 0!important;
  margin: ${(props => props.$marginLeft ? "0 0 0 10px!important" : "0!important")};
`;

const FormContainer = styled(Flex)`
  justify-content: center;
`;

const ModLabel = styled(Label)({
  width: "100%!important"
});

const HeaderContainer = styled(Flex)`
  margin-bottom: 20px!important;
`;

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
});

const WarningMessage = styled.p`
  position: relative;
  color: red!important;
  bottom: 0.5rem!important; 
`;

export { FormContainer, HeaderContainer, ModButton, ModFormField, ModInput, ModLabel, WarningMessage };

