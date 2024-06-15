import { Icon, Popup } from 'semantic-ui-react';
import { Box } from 'rebass';

export const CommentTooltip = ({ comment }) => {
  return (
    <Popup
      size="mini"
      content={comment}
      position="top center"
      trigger={
        <Box marginX="5px">
          <Icon name="info circle" color="yellow" />
        </Box>
      }
    />
  );
};
