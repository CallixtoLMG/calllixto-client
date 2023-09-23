import { Flex } from "rebass";
import { Button, Dropdown } from "semantic-ui-react";
import styled from "styled-components";

const MainContainer = styled(Flex)`
  margin: 75px 30px 30px 30px!important;
  flex-direction: column;
`;

const ModButtonProduct = styled(Button)({
  marginTop: "14px!important",
  width: "14rem!important"
})

const ModButtonBudget = styled(Button)({
  width: "14rem!important"
})

const ModDropdown = styled(Dropdown)({
  width: "20rem!important",
  display:"flex!important",
  // overflow:"hidden!important",
  // textOverflow: "ellipsis!important"
})

const Label = styled.label`
  font-size: 14px!important;
  margin-left: 15px!important;
`;
export { Label, MainContainer, ModButtonBudget, ModButtonProduct, ModDropdown };

