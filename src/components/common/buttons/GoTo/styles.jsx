import Link from "next/link";
import { Button } from "semantic-ui-react";
import styled from "styled-components";

const ModButton = styled(Button)`
  width: 170px!important;
  padding: 10px 0!important;
  display: inline-block!important;
`;

const ModLink = styled(Link)`
  width: 170px!important; 
  margin-right: 3.5px!important;
  padding-right: 0!important;
  display: inline-block!important;
`;

export { ModButton, ModLink };

