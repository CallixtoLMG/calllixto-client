import { Flex } from "rebass";
import styled from "styled-components";

const SubContainer = styled(Flex)`
  justify-content: ${(props) => props.jContent || "normal"};
  flex-wrap: wrap;
  column-gap: 20px;
  max-width: 900px;
`;

const ButtonsContainer = styled(Flex)`
  width: fit-content!important;
  align-self: self-end;
`;

const Container = styled(Flex)`
  row-gap: 15px;
  flex-direction: column;
`;

const DataContainer = styled(Flex)`
  width: ${(props) => props.width || '200px!important'};
  min-width: ${(props) => props.minWidth || "200px!important"};
  flex: ${(props) => props.flex || 'none!important'};
  margin: 0!important;
  flex-direction: column;
`;

export { ButtonsContainer, Container, DataContainer, SubContainer };
