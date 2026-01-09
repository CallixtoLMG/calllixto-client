import { Label as SLabel, List as SList } from "semantic-ui-react";
import styled from 'styled-components';

const ListItem = styled(SList.Item)`
  padding: 8px 0 !important;

  &:first-child {
    padding-top: 0 !important;
  }

  &:last-child {
    padding-bottom: 0 !important;
  }
`;

const List = styled(SList)`
  margin: 0!important;
`;

const Label = styled(SLabel)`
  padding: 0!important;
  color: rgba(0, 0, 0, .87)!important;
  background-color: inherit!important;
  font-size: 13px!important;
  margin-bottom: 4px!important;
  line-height: 20px!important;
`;

export { Label, List, ListItem };

