import { Label as SLabel, List as SList } from "semantic-ui-react";
import styled from 'styled-components';
import { FlexColumn } from "@/common/components/custom";

const HistoryDateRangesContainer = styled(FlexColumn)`
  @media (max-width: 767px) {
    width: 100% !important;
    min-width: 0;
    max-width: 100%;
  }
`;

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
  font-size: 14px!important;
  line-height: 20px!important;
`;

export { HistoryDateRangesContainer, Label, List, ListItem };

