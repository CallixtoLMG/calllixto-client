import { Box, FlexColumn } from "@/common/components/custom";
import { DropdownControlled } from "@/common/components/form";
import { BUDGET_RANGE_DATE_MONTH_OPTIONS } from "@/components/settings/settings.constants";
import { useState } from "react";
import { Accordion, Icon } from "semantic-ui-react";
import { HistoryDateRangesControlled } from "./HistoryDateRangesControlled";

const General = () => {
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const toggleAccordion = () => setIsAccordionOpen(!isAccordionOpen);

  return (
    <Box $marginBottom="5px">
      <Accordion fluid>
        <Accordion.Title active={isAccordionOpen} onClick={toggleAccordion}>
          <Icon name="dropdown" /> General
        </Accordion.Title>
        <Accordion.Content active={isAccordionOpen}>
          <FlexColumn $rowGap="15px">
            <DropdownControlled
              name="defaultPageDateRange.value"
              label="Rango de fechas por defecto Ventas"
              width="fit-content"
              placeholder="Seleccione un rango"
              options={BUDGET_RANGE_DATE_MONTH_OPTIONS}
              rules={{
                required: "Campo requerido",
              }}
            />
            <HistoryDateRangesControlled />
          </FlexColumn>
        </Accordion.Content>
      </Accordion>
    </Box>
  );
};

export default General;
