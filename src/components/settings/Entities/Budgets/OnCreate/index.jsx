import { Box, FlexColumn } from "@/common/components/custom";
import { GroupedButtonsControlled, NumberControlled, SearchControlled } from "@/common/components/form";
import { COLORS, ICONS } from "@/common/constants";
import { BUDGET_STATES, PICK_UP_IN_STORE } from "@/components/budgets/budgets.constants";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Accordion, Icon } from "semantic-ui-react";

const OnCreate = ({ customerOptions, isLoading }) => {

  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const toggleAccordion = () => setIsAccordionOpen(!isAccordionOpen);
  const { watch } = useFormContext();
  const [defaultsCreate, defaultsCreateCustomer] = watch(['defaultsCreate', "defaultsCreate.customer"]);

  return (
    <Box $marginBottom="5px">
      <Accordion fluid>
        <Accordion.Title active={isAccordionOpen} onClick={toggleAccordion}>
          <Icon name="dropdown" /> Al crear una venta
        </Accordion.Title>
        <Accordion.Content active={isAccordionOpen}>
          <FlexColumn $rowGap="15px">
            <GroupedButtonsControlled
              label="Estado por defecto"
              name="defaultsCreate.state"
              color={defaultsCreate?.state === BUDGET_STATES.CONFIRMED.id ? COLORS.GREEN : COLORS.ORANGE}
              buttons={[
                { text: 'Confirmado', icon: ICONS.CHECK, value: BUDGET_STATES.CONFIRMED.id },
                { text: 'Pendiente', icon: ICONS.HOURGLASS_HALF, value: BUDGET_STATES.PENDING.id },
              ]}
            />
            <GroupedButtonsControlled
              label="Entrega por defecto"
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
              required
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
        </Accordion.Content>
      </Accordion>
    </Box>
  );
};

export default OnCreate;
