import { formatedPhone } from "@/utils";
import { Box, Flex } from "rebass";
import { Icon, Popup } from "semantic-ui-react";

export const HEADERS = [
  {
    id: 1,
    width: 1,
    value: (customer) => customer.key
  },
  {
    id: 2,
    title: "Nombre",
    align: "left",
    value: (customer) =>
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
  },
  {
    id: 3,
    title: "Direccion",
    width: 4,
    align: "left",
    value: (customer) => customer.address
  },
  {
    id: 4,
    title: "Teléfono",
    width: 3,
    value: (customer) => formatedPhone(customer.phone.areaCode, customer.phone.number)
  },
];