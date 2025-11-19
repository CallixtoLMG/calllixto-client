import { Box, FlexColumn } from "@/common/components/custom";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Accordion, Icon } from "semantic-ui-react";

const General = () => {
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const toggleAccordion = () => setIsAccordionOpen(!isAccordionOpen);

  const { watch } = useFormContext();
  const [defaultPageDateRange, historyDateRanges] = watch(['defaultPageDateRange', 'historyDateRanges']);

  return (
    <Box $marginBottom="5px">
      <Accordion fluid>
        <Accordion.Title active={isAccordionOpen} onClick={toggleAccordion}>
          <Icon name="dropdown" /> Configuración General
        </Accordion.Title>
        <Accordion.Content active={isAccordionOpen}>
          <FlexColumn $rowGap="20px">
          </FlexColumn>
        </Accordion.Content>
      </Accordion>
    </Box>
  );
};

export default General;
