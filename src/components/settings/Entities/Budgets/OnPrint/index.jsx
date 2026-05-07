import { Box, Flex, FlexColumn } from "@/common/components/custom";
import { DropdownControlled, IconedButtonControlled, TextAreaControlled } from "@/common/components/form";
import { COLORS, ICONS } from "@/common/constants";
import { BUDGET_PDF_FORMAT } from "@/components/budgets/budgets.constants";
import SettingsAccordionTitle from "@/components/settings/Common/SettingsAccordionTitle";
import { AnimatedContent, AnimatedInner } from "@/components/settings/Common/styles";
import { SETTINGS_HELP_TEXTS } from "@/components/settings/settings.constants";
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
        <SettingsAccordionTitle
          active={isAccordionOpen}
          helpText={SETTINGS_HELP_TEXTS.BUDGET_ON_PRINT}
          onClick={toggleAccordion}
        >
          Al imprimir una venta
        </SettingsAccordionTitle>
        <Accordion.Content active>
          <AnimatedContent $active={isAccordionOpen}>
            <AnimatedInner $active={isAccordionOpen}>
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
                  width="fit-content"
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
