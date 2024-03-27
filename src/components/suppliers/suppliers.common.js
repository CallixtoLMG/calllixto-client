import { formatedPhone } from "@/utils";
import { Box, Flex } from "rebass";
import { Icon, Popup } from "semantic-ui-react";

const SUPPLIERS_COLUMNS = [
  {
    id: 1,
    title: "Id",
    width: 1,
    value: (supplier) => supplier.id
  },
  {
    id: 2,
    title: "Nombre",
    align: "left",
    value: (supplier) =>
      <Flex justifyContent="space-between">
        {supplier.name}
        {supplier.comments && (
          <Popup
            size="mini"
            content={supplier.comments}
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
    title: "Dirección",
    value: (supplier) => supplier.address
  },
  {
    id: 4,
    title: "Teléfono",
    width: 3,
    value: (supplier) => formatedPhone(supplier.phone?.areaCode, supplier.phone?.number)
  },
];

const FILTERS = [
  { value: 'id', placeholder: 'Id' },
  { value: 'name', placeholder: 'Nombre' },
];

export { FILTERS, SUPPLIERS_COLUMNS };

