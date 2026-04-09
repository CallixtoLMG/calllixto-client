import { Flex } from '@/common/components/custom';
import styled from "styled-components";

const MainContainer = styled(Flex)`
  justify-content: center!important;
  width: 100%!important;
`;

const SubContainer = styled(Flex)`
  row-gap: 15px;
  margin: 80px 20px 20px 20px!important;
  flex-direction: column;
  width: 100%!important;
  padding:50px 30px 0 30px!important;
`;

export { MainContainer, SubContainer };

