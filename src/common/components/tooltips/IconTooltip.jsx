import { Icon } from "@/common/components/custom";
import { POPUP_POSITIONS, SIZES } from "@/common/constants";
import { Popup } from "semantic-ui-react";

export const IconTooltip = ({
  ariaLabel,
  color,
  content,
  icon,
  iconProps = {},
  position = POPUP_POSITIONS.TOP_CENTER,
  size = SIZES.MINI,
  triggerProps = {},
}) => {
  const resolvedAriaLabel = ariaLabel || (typeof content === "string" ? content : undefined);

  return (
    <Popup
      size={size}
      content={content}
      position={position}
      trigger={
        <span
          {...triggerProps}
          aria-label={resolvedAriaLabel}
          role="button"
          tabIndex={0}
          style={{
            alignItems: "center",
            display: "inline-flex",
            flexShrink: 0,
            lineHeight: 1,
          }}
        >
          <Icon
            name={icon}
            color={color}
            margin="0"
            $pointer
            $lineHeight="1"
            {...iconProps}
          />
        </span>
      }
    />
  );
};
