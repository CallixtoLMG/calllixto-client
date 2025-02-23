import { Box, Icon } from "@/common/components/custom";
import { COLORS, ICONS } from "@/common/constants";
import { List, ListItem, Popup } from "semantic-ui-react";

export const AddressesTooltip = ({ addresses, input }) => {
  return (
    <Popup
      size="mini"
      content={
        <List>
          {addresses.map(address => (
            <ListItem key={`${address.ref}-${address.address}`}>
              {address.ref ? `${address.ref}: ` : "Dirección: "}<b>{address.address}</b>
            </ListItem>
          ))}
        </List>
      }
      position="top center"
      trigger={
        input
          ? <Icon enablePointerEvents name={ICONS.LIST_UL} color={COLORS.YELLOW} />
          : <Box marginLeft="5px" marginRight="5px">
            <Icon name={ICONS.LIST_UL} color={COLORS.YELLOW} />
          </Box>
      }
    />
  );
};
