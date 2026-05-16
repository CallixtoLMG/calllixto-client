import { SIZES } from '@/common/constants';
import { forwardRef } from 'react';
import { Icon, Popup } from 'semantic-ui-react';
import { Button, Flex } from '../custom';

const IconedButton = forwardRef(({
  text,
  icon,
  color,
  onClick,
  basic,
  disabled,
  loading,
  width,
  height = '35px',
  submit,
  position,
  alignSelf,
  onKeyDown,
  padding,
  iconOnly = false,
  popupPosition = 'top center',
  popupInverted = false,
  popupDisabled = false,
  popupContent,
}, ref) => {
  const buttonElement = (
    <Button
      size={SIZES.SMALL}
      icon
      $iconOnly={iconOnly}
      $alignSelf={alignSelf}
      labelPosition={iconOnly ? undefined : 'left'}
      position={position}
      basic={basic}
      width={width || (iconOnly ? '35px' : '110px')}
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
      {!iconOnly && text}
    </Button>
  );

  const shouldShowTooltip = iconOnly && !popupDisabled;

  if (!shouldShowTooltip) {
    return buttonElement;
  }

  const popupTrigger = (
    <Flex $alignSelf={alignSelf || "flex-end"}>
      {buttonElement}
    </Flex>
  );

  return (
    <Popup
      content={popupContent || text}
      position={popupPosition}
      inverted={popupInverted}
      size={SIZES.TINY}
      trigger={popupTrigger}
    />
  );
});

IconedButton.displayName = 'IconedButton';

export default IconedButton;
