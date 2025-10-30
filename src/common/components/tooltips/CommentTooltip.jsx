import { COLORS, ICONS } from '@/common/constants';
import { Popup } from 'semantic-ui-react';
import { Icon } from '../custom';

export const CommentTooltip = ({ comment, tooltip, lineHeight }) => {
  return (
    <Popup
      size="mini"
      content={comment}
      position="top center"
      trigger={<Icon margin="0px" tooltip={tooltip} $lineHeight={lineHeight} name={ICONS.INFO_CIRCLE} color={COLORS.BLUE} />}
    />
  );
};
