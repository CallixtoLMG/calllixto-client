import { SIZES } from '@/common/constants';
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
  onKeyDown,
  padding
}, ref) => {
  return (
    <Button
      size={SIZES.SMALL}
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
      onKeyDown={onKeyDown}
      ref={ref}
    >
      <Icon name={icon} />
      {text}
    </Button>
  );
});

IconedButton.displayName = 'IconedButton';

export default IconedButton;