import { Box, FlexColumn } from "@/common/components/custom";
import { GroupedButtonsControlled, NumberControlled, SearchControlled } from "@/common/components/form";
import { COLORS, ICONS } from "@/common/constants";
import { BUDGET_STATES, PICK_UP_IN_STORE } from "@/components/budgets/budgets.constants";
import { useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { Accordion, Icon } from "semantic-ui-react";
import { getCustomerSearchDescription, getCustomerSearchTitle } from "../../../../customers/customers.constants";

const OnCreate = ({ customerOptions, isLoading }) => {

  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const toggleAccordion = () => setIsAccordionOpen(!isAccordionOpen);

  const { watch, setValue } = useFormContext();
  const [defaultsCreate, defaultsCreateCustomer] = watch(['defaultsCreate', "defaultsCreate.customer"]);

  const selectedCustomer = useMemo(() => {
    return customerOptions?.find(c => c.id === defaultsCreateCustomer) ?? null;
  }, [defaultsCreateCustomer, customerOptions]);

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
            <SearchControlled
              key={defaultsCreateCustomer?.id ?? 'no-customer'}
              name="defaultsCreate.customer"
              width="300px"
              label="Cliente por Defecto"
              disabled={isLoading}
              required
              clearable={!!defaultsCreateCustomer?.name}
              value={selectedCustomer}
              placeholder="A0001"
              elements={customerOptions}
              searchFields={['name', 'id']}
              getResultProps={(customer) => ({
                key: customer.id,
                title: getCustomerSearchTitle(customer),
                description: getCustomerSearchDescription(customer),
                value: customer,
              })}
              persistSelection={true}
              onAfterChange={(value) => {
                const customerId = value?.id ?? null;
                setValue('defaultsCreate.customer', customerId)
              }}
            />
            <NumberControlled
              name="defaultsCreate.expirationOffsetDays"
              label="Días para el Vencimiento por Defecto"
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
