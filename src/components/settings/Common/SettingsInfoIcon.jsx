import { IconTooltip } from "@/common/components/tooltips";
import { POPUP_POSITIONS, COLORS, ICONS, SIZES } from "@/common/constants";

const SettingsInfoIcon = ({ content }) => {
  if (!content) return null;

  const stopAccordionToggle = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <IconTooltip
      content={content}
      icon={ICONS.INFO_CIRCLE}
      color={COLORS.BLUE}
      size={SIZES.TINY}
      position={POPUP_POSITIONS.TOP_CENTER}
      ariaLabel="Ayuda"
      iconProps={{ margin: "0 0 0 8px" }}
      triggerProps={{
        onClick: stopAccordionToggle,
        onMouseDown: stopAccordionToggle,
      }}
    />
  );
};

export default SettingsInfoIcon;
