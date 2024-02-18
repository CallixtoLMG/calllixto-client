import { Flex } from "rebass";
import styled from "styled-components";

const Form = styled.form`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  column-gap: 10px;
`;

const ButtonContainer = styled(Flex)`
  width: 180px!important;
  height: 40px!important;
`;

export { ButtonContainer, Form };

