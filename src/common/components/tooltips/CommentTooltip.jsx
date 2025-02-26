import { COLORS, ICONS } from '@/common/constants';
import { Popup } from 'semantic-ui-react';
import { Icon } from '../custom';

export const CommentTooltip = ({ comment }) => {
  return (
    <Popup
      size="mini"
      content={comment}
      position="top center"
      trigger={<Icon tooltip name={ICONS.INFO_CIRCLE} color={COLORS.BLUE} />}
    />
  );
};
