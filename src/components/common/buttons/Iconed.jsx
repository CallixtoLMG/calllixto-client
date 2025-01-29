import { COLORS } from '@/constants';
import { Icon } from 'semantic-ui-react';

const IconedButton = styled(SButton)`
  font-weight: 500 !important;
  &&&& {
    text-align: center;
    height: ${({ height = '35px' }) => `${height}!important`} ;
    font-size: 13.5px !important;
    width: ${({ width = '110px' }) => `${width}!important`} ;
    padding-left: ${({ paddingLeft = '40px' }) => `${paddingLeft}!important`} ;
    padding: ${({ padding }) => padding && "0 18px 0 40px"}!important ;
    margin-right: 0;
  };
`;

const Iconned = ({
  text,
  icon,
  color = COLORS.BLUE,
  onClick,
  basic,
  disabled,
  loading,
  width = 'fit-content',
  height,
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
