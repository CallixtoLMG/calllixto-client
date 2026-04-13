import { AccordionTitle, Box, Flex, FlexColumn, Icon } from "@/common/components/custom";
import { DropdownControlled, IconedButtonControlled, TextAreaControlled } from "@/common/components/form";
import { COLORS, ICONS } from "@/common/constants";
import { BUDGET_PDF_FORMAT } from "@/components/budgets/budgets.constants";
import { AnimatedContent, AnimatedInner } from "@/components/settings/Common/styles";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Accordion, } from "semantic-ui-react";

const OnPrint = () => {
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const toggleAccordion = () => setIsAccordionOpen(!isAccordionOpen);

  const { watch } = useFormContext();
  const [defaultsPDF] = watch(['defaultsPDF']);

  return (
    <Box $marginBottom="5px">
      <Accordion fluid>
        <AccordionTitle active={isAccordionOpen} onClick={toggleAccordion}>
          <Icon $height="20px" name={ICONS.CARET_UP} /> Al imprimir una venta
        </AccordionTitle>
        <Accordion.Content active>
          <AnimatedContent active={isAccordionOpen}>
            <AnimatedInner>
              <FlexColumn $rowGap="15px">
                <IconedButtonControlled
                  name="defaultsPDF.showPrices"
                  label="Mostrar precios por defecto"
                  text="Mostrar precios"
                  icon={ICONS.EYE}
                  color={COLORS.BLUE}
                  basic={!defaultsPDF?.showPrices}
                />
                <DropdownControlled
                  name="defaultsPDF.printPdfMode"
                  label="Modo de impresión por defecto"
                  options={Object.values(BUDGET_PDF_FORMAT).map(option => ({ value: option.key, key: option.key, text: <Flex>{option.title}</Flex> }))}
                  defaultValue={BUDGET_PDF_FORMAT.CLIENT.key}
                  width="200px"
                />
                <TextAreaControlled
                  name="defaultsPDF.customPDFDisclaimer"
                  label="Descargo de responsabilidad"
                  placeholder="Ej: Por favor controle su pedido. No se aceptan reclamos, devoluciones o cambios una vez firmado el remito de entrega. La mercadería se descarga al pie del camión, sin excepción."
                />
              </FlexColumn>
            </AnimatedInner>
          </AnimatedContent>
        </Accordion.Content>
      </Accordion>
    </Box>
  );
};

export default OnPrint;
