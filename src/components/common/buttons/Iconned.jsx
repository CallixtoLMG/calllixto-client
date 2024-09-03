import { Icon } from 'semantic-ui-react';
import { IconedButton } from "../custom";

const Iconned = ({
  text,
  icon,
  color = 'blue',
  onClick,
  basic,
  disabled,
  loading,
  width = 'fit-content',
  height = "inherit",
  submit
}) => {

  return (
    <IconedButton
      size="small"
      icon
      labelPosition="left"
      basic={basic}
      width={width}
      height={height}
      color={color}
      onClick={onClick}
      disabled={disabled}
      loading={loading}
      type={submit ? 'submit' : 'button'}
    >
      <Icon name={icon} />
      {text}
    </IconedButton>
  );
};

export default Iconned;
