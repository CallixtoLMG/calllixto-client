import { Flex } from "rebass";
import { Label } from "semantic-ui-react";
import styled from "styled-components";

const TitleContainer = styled(Flex)`
  width: 100%!important;
  justify-content: center!important;
  margin-bottom: 20px!important;
`;

const Title = styled(Label)`
  font-size: 20px!important;
  min-width: 30vw!important;
  min-height: 34px!important;
  text-align: center!important;
  padding: 7px!important;
`;

export { Title, TitleContainer };

