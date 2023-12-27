import Link from "next/link";
import { Button } from "semantic-ui-react";
import styled from "styled-components";

const ModButton = styled(Button)`
  width: ${(props) => props.text ? "170px!important" : "50px!important"};
  padding: 10px 0!important;
  display: inline-block!important;
  i.icon {
    margin: ${(props) => !props.text && "0!important"};
  };
`;

const ModLink = styled(Link)`
  margin-right: 3.5px!important;
  padding-right: 0!important;
  display: inline-block!important;
`;

export { ModButton, ModLink };

