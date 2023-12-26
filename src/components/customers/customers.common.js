import { Cell } from "@/components/common/table";
import { formatedPhone } from "@/utils";
import { Box, Flex } from "rebass";
import { Icon, Popup } from "semantic-ui-react";

export const HEADERS = [
  {
    id: 1,
    value: (customer) => <Cell width={1}>{customer.key}</Cell>
  },
  {
    id: 2,
    title: "Nombre",
    value: (customer) => <Cell align="left">
      <Flex justifyContent="space-between">
        {customer.name}
        {customer.comments && (
          <Popup
            size="mini"
            content={customer.comments}
            position="top center"
            trigger={
              <Box marginX="5px">
                <Icon name="info circle" color="orange" />
              </Box>
            }
          />
        )}
      </Flex>
    </Cell>
  },
  {
    id: 3,
    title: "Direccion",
    value: (customer) => <Cell width={4}>{customer.address}</Cell>
  },
  {
    id: 4,
    title: "Teléfono",
    value: (customer) => <Cell width={3}>{formatedPhone(customer.phone.areaCode, customer.phone.number)}</Cell>
  },
];