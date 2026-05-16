import { Icon } from "@/common/components/custom";
import { COLORS, ICONS, SIZES } from "@/common/constants";
import { Popup } from "semantic-ui-react";

const SettingsInfoIcon = ({ content }) => {
  if (!content) return null;

  const stopAccordionToggle = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <Popup
      content={content}
      position="top center"
      size={SIZES.TINY}
      trigger={
        <span
          aria-label="Ayuda"
          onClick={stopAccordionToggle}
          onMouseDown={stopAccordionToggle}
          role="button"
          tabIndex={0}
        >
          <Icon
            name={ICONS.INFO_CIRCLE}
            color={COLORS.BLUE}
            margin="0 0 0 8px"
            $pointer
          />
        </span>
      }
    />
  );
};

export default SettingsInfoIcon;
