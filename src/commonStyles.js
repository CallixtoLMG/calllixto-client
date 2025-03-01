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
  width: 90%!important;
  max-width: 1600px!important;
  padding-top: 50px!important;
`;

export { MainContainer, SubContainer };

