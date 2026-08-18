import { Header as SHeader, Modal as SModal } from 'semantic-ui-react';
import styled from 'styled-components';

const MOBILE_BREAKPOINT = "767px";

export const Header = styled(SHeader)`
  margin: 0!important;
`;

export const ModalContent = styled(SModal.Content)`
  max-height: calc(100vh - 180px);
  overflow-y: auto;
  padding-right: 60px!important;

  @media (max-width: ${MOBILE_BREAKPOINT}) {
    && {
      padding-left: 1rem!important;
      padding-right: 1rem!important;
    }
  }
`;
