import { COLORS, ICONS } from '@/constants';
import { Icon, Popup } from 'semantic-ui-react';

export const CommentTooltip = ({ comment }) => {
  return (
    <Popup
      size="mini"
      content={comment}
      position="top center"
      trigger={<Icon name={ICONS.INFO_CIRCLE} color={COLORS.YELLOW} />}
    />
  );
};
