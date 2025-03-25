import { COLORS } from '@/common/constants';
import { Icon } from 'semantic-ui-react';
import { Button } from '../custom';

const IconedButton = ({
  text,
  icon,
  color = COLORS.BLUE,
  onClick,
  basic,
  disabled,
  loading,
  width = 'fit-content',
  height,
  submit,
  position,
  alignSelf
}) => {
  return (
    <Button
      size="small"
      icon
      alignSelf={alignSelf}
      labelPosition="left"
      position={position}
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
    </Button>
  );
};

export default IconedButton;
