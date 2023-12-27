import { Icon, Popup } from "semantic-ui-react";
import { Flex, Box } from "rebass";

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
                <Icon name="info circle" color="orange" />
              </Box>
            }
          />
        )}
      </Flex>
  }
];

export {
  BRAND_COLUMNS
};
