import Link from "next/link";
import { Icon } from "semantic-ui-react";
import { ModButton } from "./styles";

const ButtonGoTo = ({ goTo, iconName, text, color }) => {
  return (
    <Link href={goTo}>
      <ModButton color={color}> <Icon name={iconName} />{text}</ModButton>
    </Link>
  )
};

export default ButtonGoTo;

