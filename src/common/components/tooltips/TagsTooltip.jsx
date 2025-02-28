import { COLORS, ICONS } from "@/common/constants";
import { Popup } from "semantic-ui-react";
import { Flex, Icon, Label } from "../custom";

export const TagsTooltip = ({ tags, tooltip }) => {
  if (!tags || tags.length === 0) return null;

  return (
    <Flex columnGap="7px" alignItems="center">
      <Popup
        size="mini"
        trigger={
          <Label width="fit-contents" size="tiny" color={tags[0]?.color}>
            {tags[0]?.name}
          </Label>
        }
        content={tags[0]?.description || "Sin comentarios"}
        position="top center"
        disabled={!tags[0]?.description}
      />
      {tags.length > 1 && (
        <Popup
          size="mini"
          hoverable
          trigger={<Icon tooltip={tooltip} margin="0" name={ICONS.TAGS} color={COLORS.BLUE} />}
          content={
            <Flex columnGap="5px" >
              {tags.slice(1).map((tag, index) => (
                tag.description ? <Popup
                  key={index}
                  size="mini"
                  trigger={
                    <Label size="mini" color={tag.color}>
                      {tag.name}
                    </Label>
                  }
                  content={tag.description}
                  position="top center"
                /> :
                  <Label size="mini" color={tag.color}>
                    {tag.name}
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