import { Input as SInput } from "semantic-ui-react";
import styled from "styled-components";

const Input = styled(SInput)`
  min-width: 250px !important;
`;

const Form = styled.form`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  column-gap: 10px;
`;

export { Input, Form };

