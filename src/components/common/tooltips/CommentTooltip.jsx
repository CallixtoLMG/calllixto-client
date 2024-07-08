import { Icon, Popup } from 'semantic-ui-react';

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
