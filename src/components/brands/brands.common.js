import { Cell } from "@/components/common/table";
import { Icon, Popup } from "semantic-ui-react";
import { Flex, Box } from "rebass";

const BRAND_COLUMNS = [
  {
    title: "Id",
    id: 1,
    value: (brand) => <Cell width={1}>{brand.id}</Cell>
  },
  {
    title: "Nombre",
    id: 4,
    value: (brand) => <Cell align="left">
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
    </Cell>
  }
];

export {
  BRAND_COLUMNS
};
