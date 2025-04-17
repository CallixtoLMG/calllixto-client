import { forwardRef } from 'react';
import { Icon } from 'semantic-ui-react';
import { Button } from '../custom';

const IconedButton = forwardRef(({
  text,
  icon,
  color,
  onClick,
  basic,
  disabled,
  loading,
  width = 'fit-content',
  height,
  submit,
  position,
  alignSelf,
  padding
}, ref) => {
  return (
    <Button
      size="small"
      icon
      $alignSelf={alignSelf}
      labelPosition="left"
      position={position}
      basic={basic}
      width={width}
      padding={padding}
      height={height}
      color={color}
      onClick={onClick}
      disabled={disabled}
      loading={loading}
      type={submit ? 'submit' : 'button'}
      ref={ref}
    >
      <Icon name={icon} />
      {text}
    </Button>
  );
});

export default IconedButton;

IconedButton.displayName = 'IconedButton';
