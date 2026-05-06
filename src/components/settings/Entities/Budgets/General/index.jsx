import { Box, FlexColumn } from "@/common/components/custom";
import { DropdownControlled } from "@/common/components/form";
import SettingsAccordionTitle from "@/components/settings/Common/SettingsAccordionTitle";
import { AnimatedContent, AnimatedInner } from "@/components/settings/Common/styles";
import { BUDGET_RANGE_DATE_MONTH_OPTIONS, SETTINGS_HELP_TEXTS } from "@/components/settings/settings.constants";
import { useState } from "react";
import { Accordion, } from "semantic-ui-react";
import { HistoryDateRangesControlled } from "./HistoryDateRangesControlled";

const General = () => {
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const toggleAccordion = () => setIsAccordionOpen(!isAccordionOpen);

  return (
    <Box $marginBottom="5px">
      <Accordion fluid>
        <SettingsAccordionTitle
          active={isAccordionOpen}
          helpText={SETTINGS_HELP_TEXTS.BUDGET_GENERAL}
          onClick={toggleAccordion}
        >
          General
        </SettingsAccordionTitle>
        <Accordion.Content active>
          <AnimatedContent $active={isAccordionOpen}>
            <AnimatedInner>
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
            </AnimatedInner>
          </AnimatedContent>
        </Accordion.Content>
      </Accordion>
    </Box>
  );
};

export default General;
