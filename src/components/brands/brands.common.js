import { Box, Flex } from "rebass";
import { Icon, Popup } from "semantic-ui-react";

const ATTRIBUTES = { ID: "id", NAME: "name" };

const BRAND_COLUMNS = [
  {
    id: 1,
    title: "Id",
    width: 1,
    value: (brand) => brand.id
  },
  {
    id: 2,
    title: "Nombre",
    align: "left",
    value: (brand) =>
      <Flex justifyContent="space-between">
        {brand.name}
        {brand.comments && (
          <Popup
            size="mini"
            content={brand.comments}
            position="top center"
            trigger={
              <Box marginX="5px">
                <Icon name="info circle" color="yellow" />
              </Box>
            }
          />
        )}
      </Flex>
  }
];

const FILTERS = [
  { value: 'id', placeholder: 'Id' },
  { value: 'name', placeholder: 'Nombre' },
];

export {
  ATTRIBUTES, BRAND_COLUMNS,
  FILTERS
};

