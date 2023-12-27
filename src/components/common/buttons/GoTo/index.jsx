import { Icon } from "semantic-ui-react";
import { ModButton, ModLink } from "./styles";

const ButtonGoTo = ({ goTo, iconName, text, color }) => {
  return (
    <ModLink href={goTo}>
      <ModButton text={text} fluid color={color}> <Icon name={iconName} />{text}</ModButton>
    </ModLink>
  );
};

export default ButtonGoTo;

