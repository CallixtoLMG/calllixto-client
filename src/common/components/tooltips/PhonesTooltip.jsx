import { Flex, Icon } from "@/common/components/custom";
import { POPUP_POSITIONS, COLORS, ICONS } from "@/common/constants";
import { getFormatedPhone } from "@/common/utils";
import { List, ListItem, Popup } from "semantic-ui-react";

export const PhonesTooltip = ({ phones, input, $lowTooltip }) => {
  return (
    <Popup
      size="mini"
      content={
        <List>
          {phones.map(phone => (
            <ListItem key={`${phone.areaCode}-${phone.number}`}>
              <b>  {phone.ref ? `${phone.ref}:` : "Contacto: "}</b> {getFormatedPhone(phone)}
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
