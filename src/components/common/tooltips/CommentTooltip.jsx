import { Icon, Popup } from 'semantic-ui-react';
import { Box } from 'rebass';

export const CommentTooltip = ({ comment }) => {
  return (
    <Popup
      size="mini"
      content={comment}
      position="top center"
      trigger={<Icon name="info circle" color="yellow" />}
    />
  );
};
