import { COLORS, ICONS } from "@/common/constants";
import { Popup } from "semantic-ui-react";
import { Flex, Icon, Label } from "../custom";

export const TagsTooltip = ({ tags, tooltip }) => {
  const validTags = (tags || []).filter(tag => tag && tag.name);
  if (!tags || tags.length === 0) return null;

  return (
    <Flex $columnGap="7px" $alignItems="center">
      <Popup
        size="mini"
        trigger={
          <Label width="fit-contents" size="tiny" color={validTags[0]?.color}>
            {validTags[0]?.name}
          </Label>
        }
        content={validTags[0]?.description || "Sin comentarios"}
        position="top center"
        disabled={!validTags[0]?.description}
      />
      {validTags.length > 1 && (
        <Popup
          size="mini"
          hoverable
          trigger={<Icon tooltip={tooltip} margin="0" name={ICONS.TAGS} color={COLORS.BLUE} />}
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
                    position="top center"
                  /> :
                  <Label key={tag?.name} size="mini" color={tag?.color}>
                    {tag?.name}
                  </Label>
              ))}
            </Flex>
          }
          position="top center"
        />
      )}
    </Flex>
  );
};