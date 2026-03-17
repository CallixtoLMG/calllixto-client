import { Accordion as SAccordion } from "semantic-ui-react";
import styled from 'styled-components';

const Accordion = styled(SAccordion)`
  margin: 0px!important; 
`;

const AccordionContent = styled(SAccordion.Content)`
  padding-left: 35px!important; 
`;

const AccordionTitle = styled(SAccordion.Title)`
  font-size: 18px!important; 
`;

export { Accordion, AccordionContent, AccordionTitle };

