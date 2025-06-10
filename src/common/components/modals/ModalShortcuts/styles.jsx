import { Header as SHeader, Icon as SIcon, List as SList, Modal as SModal } from 'semantic-ui-react';
import styled from 'styled-components';

const StyledModalHeader = styled(SHeader)`
  background-color: #2185d0 !important;
  color: white !important;
  border-radius: 3px 3px 0 0 !important;
`;

const StyledModalContent = styled(SModal.Content)`
  font-size: 1.2em !important;
`;

const StyledListIcon = styled(SList.Icon)`
  color: #2185d0 !important;
`;

const HelpIcon = styled(SIcon)`
  cursor: pointer;
  display: flex !important;
  align-self: center;
  margin-right: 10px !important;
`;

const StyledListHeader = styled(SList.Header)`
  margin-bottom: 5px !important;
`;

export {
  HelpIcon, StyledListHeader, StyledListIcon, StyledModalContent, StyledModalHeader
};

