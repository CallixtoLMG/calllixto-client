import Link from "next/link";
import { Flex } from "rebass";
import { Table } from "semantic-ui-react";
import styled from "styled-components";

const ButtonContainer = styled(Flex)`
  flex-direction: row;
  margin-bottom: 20px!important;
  justify-content: space-between;
`;

const ModLink = styled(Link)({
  width: "fit-content",
});

const ModTable = styled(Table)`
  tbody:nth-child(odd) {
    background-color: #f2f2f2!important;
  };
  margin-top: 0!important;
`;

export { ButtonContainer, ModLink, ModTable };

