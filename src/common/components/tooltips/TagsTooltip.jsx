import { POPUP_POSITIONS, CONTENT_SIZES, COLORS, ICONS, SIZES } from "@/common/constants";
import { Popup } from "semantic-ui-react";
import { Flex, Icon, Label, OverflowWrapper } from "../custom";

export const TagsTooltip = ({ tags, tooltip, maxWidthOverflow, lineClamp }) => {
  const validTags = (tags || []).filter(tag => tag && tag.name);
  if (!tags || tags.length === 0) return null;

  return (
    <Flex $columnGap="7px" $alignItems="center">
      <Popup
        size="mini"
        trigger={
          <Label pointerEvents="auto" $ZIndex="2" width={CONTENT_SIZES.FIT} size={SIZES.TINY} color={validTags[0]?.color}>
            <OverflowWrapper position={POPUP_POSITIONS.BOTTOM_CENTER} maxWidth={maxWidthOverflow} $lineClamp={lineClamp} popupContent={validTags[0]?.name}>
              {validTags[0]?.name}
            </OverflowWrapper>
          </Label>
        }
        content={validTags[0]?.description || "Sin comentarios"}
        position={POPUP_POSITIONS.TOP_CENTER}
        disabled={!validTags[0]?.description}
      />
      {validTags.length > 1 && (
        <Popup
          size="mini"
          hoverable
          trigger={<Icon $tooltip={tooltip} margin="0" name={ICONS.TAGS} color={COLORS.BLUE} />}
          content={
            <Flex $columnGap="5px" >
              {validTags.slice(1).map((tag) => (
                tag?.description
                  ? <Popup
                    key={tag.name}
                    size="mini"
                    trigger={
                      <Label size="mini" color={tag?.color}>
                        {tag.name}
                      </Label>
                    }
                    content={tag.description}
                    position={POPUP_POSITIONS.TOP_CENTER}
                  /> :
                  <Label key={tag?.name} size="mini" color={tag?.color}>
                    {tag?.name}
                  </Label>
              ))}
            </Flex>
          }
          position={POPUP_POSITIONS.TOP_CENTER}
        />
      )}
    </Flex>
  );
};