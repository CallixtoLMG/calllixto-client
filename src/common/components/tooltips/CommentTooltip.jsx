import { COLORS, ICONS } from '@/common/constants';
import { Popup } from 'semantic-ui-react';
import { Icon } from '../custom';

export const CommentTooltip = ({ comment, $tooltip, lineHeight, $lowTooltip }) => {
  return (
    <Popup
      size="mini"
      content={comment}
      position="right center"
      trigger={<Icon fontSize="larger" margin="0px" $lowTooltip={$lowTooltip} $tooltip={$tooltip} $lineHeight={lineHeight} name={ICONS.INFO_CIRCLE} color={COLORS.BLUE} />}
    />
  );
};
