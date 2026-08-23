import { Flex, Icon } from "@/common/components/custom";
import { POPUP_POSITIONS, COLORS, ICONS } from "@/common/constants";
import { List, ListItem, Popup } from "semantic-ui-react";

export const AddressesTooltip = ({ addresses, input, $lowTooltip }) => {
  return (
    <Popup
      size="mini"
      content={
        <List>
          {addresses.map(address => (
            <ListItem key={`${address.ref}-${address.address}`}>
              <b>{address.ref ? `${address.ref}: ` : "Dirección: "}</b> {address.address}
            </ListItem>
          ))}
        </List>
      }
      position={POPUP_POSITIONS.TOP_CENTER}
      trigger={
        input
          ? <Icon name={ICONS.LIST_UL} color={COLORS.BLUE} />
          : <Flex $marginLeft="5px" $marginRight="5px">
            <Icon $lowTooltip={$lowTooltip} name={ICONS.LIST_UL} color={COLORS.BLUE} />
          </Flex>
      }
    />
  );
};
