import { POPUP_POSITIONS, COLORS, ICONS } from '@/common/constants';
import { IconTooltip } from './IconTooltip';

export const CommentTooltip = ({ comment, $tooltip, lineHeight, $lowTooltip }) => {
  return (
    <IconTooltip
      size="mini"
      content={comment}
      icon={ICONS.INFO_CIRCLE}
      color={COLORS.BLUE}
      position={POPUP_POSITIONS.RIGHT_CENTER}
      ariaLabel="Comentario"
      iconProps={{
        fontSize: "larger",
        margin: "0px",
        $lowTooltip,
        $tooltip,
        $lineHeight: lineHeight,
        $pointer: false,
      }}
    />
  );
};
