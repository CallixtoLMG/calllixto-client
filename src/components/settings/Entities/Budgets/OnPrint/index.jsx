import { Box, Flex, FlexColumn } from "@/common/components/custom";
import { DropdownControlled, IconedButtonControlled } from "@/common/components/form";
import { COLORS, ICONS } from "@/common/constants";
import { BUDGET_PDF_FORMAT } from "@/components/budgets/budgets.constants";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Accordion, Icon } from "semantic-ui-react";

const OnPrint = () => {
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const toggleAccordion = () => setIsAccordionOpen(!isAccordionOpen);

  const { watch } = useFormContext();
  const [defaultsPDF] = watch(['defaultsPDF']);

  return (
    <Box $marginBottom="5px">
      <Accordion fluid>
        <Accordion.Title active={isAccordionOpen} onClick={toggleAccordion}>
          <Icon name="dropdown" /> Al Imprimir una Venta
        </Accordion.Title>
        <Accordion.Content active={isAccordionOpen}>
          <FlexColumn $rowGap="20px">
            <IconedButtonControlled
              name="defaultsPDF.showPrices"
              label="Mostrar Precios por Defecto"
              text="Mostrar Precios"
              icon={ICONS.EYE}
              color={COLORS.BLUE}
              basic={!defaultsPDF?.showPrices}
            />
            <DropdownControlled
              name="defaultsPDF.printPdfMode"
              label="Modo de Impresión por Defecto"
              options={Object.values(BUDGET_PDF_FORMAT).map(option => ({ value: option.key, key: option.key, text: <Flex>{option.title}</Flex>}))}
              defaultValue={BUDGET_PDF_FORMAT.CLIENT.key}
              width="200px"
            />
          </FlexColumn>
        </Accordion.Content>
      </Accordion>
    </Box>
  );
};

export default OnPrint;
