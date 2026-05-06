import { Box, FlexColumn } from "@/common/components/custom";
import { GroupedButtonsControlled, NumberControlled, SearchControlled } from "@/common/components/form";
import { COLORS, ICONS } from "@/common/constants";
import { BUDGET_STATES, PICK_UP_IN_STORE } from "@/components/budgets/budgets.constants";
import SettingsAccordionTitle from "@/components/settings/Common/SettingsAccordionTitle";
import { AnimatedContent, AnimatedInner } from "@/components/settings/Common/styles";
import { SETTINGS_HELP_TEXTS } from "@/components/settings/settings.constants";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Accordion } from "semantic-ui-react";

const OnCreate = ({ customerOptions, isLoading }) => {

  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const toggleAccordion = () => setIsAccordionOpen(!isAccordionOpen);
  const { watch } = useFormContext();
  const [defaultsCreate, defaultsCreateCustomer] = watch(['defaultsCreate', "defaultsCreate.customer"]);

  return (
    <Box $marginBottom="5px">
      <Accordion fluid>
        <SettingsAccordionTitle
          active={isAccordionOpen}
          helpText={SETTINGS_HELP_TEXTS.BUDGET_ON_CREATE}
          onClick={toggleAccordion}
        >
          Al crear una venta
        </SettingsAccordionTitle>
        <Accordion.Content active>
          <AnimatedContent $active={isAccordionOpen}>
            <AnimatedInner>
              <FlexColumn $rowGap="15px">
                <GroupedButtonsControlled
                  label="Estado por defecto"
                  name="defaultsCreate.state"
                  width="fit-content"
                  color={defaultsCreate?.state === BUDGET_STATES.CONFIRMED.id ? COLORS.GREEN : COLORS.ORANGE}
                  buttons={[
                    { text: 'Confirmado', icon: ICONS.CHECK, value: BUDGET_STATES.CONFIRMED.id },
                    { text: 'Pendiente', icon: ICONS.HOURGLASS_HALF, value: BUDGET_STATES.PENDING.id },
                  ]}
                />
                <GroupedButtonsControlled
                  label="Entrega por defecto"
                  width="fit-content"
                  color={COLORS.BLUE}
                  name="defaultsCreate.pickUpInStore"
                  buttons={[
                    { text: PICK_UP_IN_STORE, icon: ICONS.WAREHOUSE, value: true },
                    { text: 'Enviar a dirección', icon: ICONS.TRUCK, value: false },
                  ]}
                />
                <SearchControlled
                  name="defaultsCreate.customer"
                  width="300px"
                  label="Cliente por defecto"
                  disabled={isLoading}
                  clearable
                  placeholder="A0001"
                  elements={customerOptions}
                  searchFields={['text', 'value']}
                  getResultProps={(option) => ({
                    key: option.key,
                    title: option.text,
                    description: option.value,
                    value: option
                  })}
                  persistSelection={true}
                  getDisplayValue={(value) => value.text ?? ''}
                />
                <NumberControlled
                  name="defaultsCreate.expirationOffsetDays"
                  label="Días para el vencimiento por defecto"
                  width="fit-content"
                  placeholder="15"
                />
              </FlexColumn>
            </AnimatedInner>
          </AnimatedContent>
        </Accordion.Content>
      </Accordion>
    </Box>
  );
};

export default OnCreate;
