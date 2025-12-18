import { Box, FlexColumn } from "@/common/components/custom";
import { GroupedButtonsControlled, NumberControlled, TextControlled } from "@/common/components/form";
import { COLORS, ICONS } from "@/common/constants";
import { BUDGET_STATES, PICK_UP_IN_STORE } from "@/components/budgets/budgets.constants";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Accordion, Icon } from "semantic-ui-react";

const OnCreate = () => {
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const toggleAccordion = () => setIsAccordionOpen(!isAccordionOpen);

  const { watch } = useFormContext();
  const [defaultsCreate] = watch(['defaultsCreate']);

  return (
    <Box $marginBottom="5px">
      <Accordion fluid>
        <Accordion.Title active={isAccordionOpen} onClick={toggleAccordion}>
          <Icon name="dropdown" /> Al Crear una Venta
        </Accordion.Title>
        <Accordion.Content active={isAccordionOpen}>
          <FlexColumn $rowGap="20px">
            <GroupedButtonsControlled
              label="Estado por Defecto"
              name="defaultsCreate.state"
              color={defaultsCreate?.state === BUDGET_STATES.CONFIRMED.id ? COLORS.GREEN : COLORS.ORANGE}
              buttons={[
                { text: 'Confirmado', icon: ICONS.CHECK, value: BUDGET_STATES.CONFIRMED.id },
                { text: 'Pendiente', icon: ICONS.HOURGLASS_HALF, value: BUDGET_STATES.PENDING.id },
              ]}
            />
            <GroupedButtonsControlled
              label="Entrega por Defecto"
              color={COLORS.BLUE}
              name="defaultsCreate.pickUpInStore"
              buttons={[
                { text: PICK_UP_IN_STORE, icon: ICONS.WAREHOUSE, value: true },
                { text: 'Enviar a Dirección', icon: ICONS.TRUCK, value: false },
              ]}
            />
            <TextControlled name="defaultsCreate.customer" placeholder="A0001" width="200px" label="Cliente por Defecto" />
            <NumberControlled
              name="defaultsCreate.expirationOffsetDays"
              label="Días para el Vencimiento por Defecto"
              width="300px"
              placeholder="15"
            />
          </FlexColumn>
        </Accordion.Content>
      </Accordion>
    </Box>
  );
};

export default OnCreate;
