import NLink from "next/link";
import { Icon, Button as SButton } from "semantic-ui-react";
import styled from "styled-components";

const Button = styled(SButton)`
  width: ${(props) => props.text ? "170px!important" : "50px!important"};
  padding: 10px 0!important;
  display: inline-block!important;
  i.icon {
    margin: ${(props) => !props.text && "0!important"};
  };
  margin-right: 0 !important;
`;

const Link = styled(NLink)`
  padding-right: 0!important;
  display: inline-block!important;
`;

const ButtonGoTo = ({ goTo, iconName, text, color }) => {
  return (
    <Link href={goTo}>
      <Button text={text} fluid color={color}> <Icon name={iconName} />{text}</Button>
    </Link>
  );
};

export default ButtonGoTo;
