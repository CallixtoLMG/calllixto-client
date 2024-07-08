import styled from "styled-components";
import { Flex } from '@/components/common/custom';

const Form = styled.form`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  column-gap: 10px;
`;

const ButtonContainer = styled(Flex)`
  width: 180px!important;
  height: 40px!important;
  margin-top: 5px!important;
`;

export { ButtonContainer, Form };

