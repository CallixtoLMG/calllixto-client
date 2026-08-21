import { Box, Button, Flex, Icon } from '@/common/components/custom';
import { COLORS, ICONS, POPUP_POSITIONS, SIZES } from '@/common/constants';
import { cloneElement, createContext, isValidElement, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Popup } from 'semantic-ui-react';
import styled from 'styled-components';
import { IconedButton } from '../../common/components/buttons';

const NavActionsContext = createContext();

const NavActionsProvider = ({ children }) => {
  const [actions, setActions] = useState([]);
  const [info, setInfo] = useState(null);
  const resetActions = () => setActions([]);

  return (
    <NavActionsContext.Provider value={{ actions, setActions, info, setInfo, resetActions }}>
      {children}
    </NavActionsContext.Provider>
  );
};

const useNavActionsContext = () => {
  const context = useContext(NavActionsContext);
  if (context === undefined) {
    throw new Error('useNavActionsContext must be used within a NavActionsProvider');
  }
  return context;
};

const NAV_ACTION_VARIANTS = {
  HORIZONTAL: "horizontal",
  SIDEBAR_COLLAPSED: "sidebar-collapsed",
  SIDEBAR_EXPANDED: "sidebar-expanded",
};
const SIDEBAR_HORIZONTAL_INSET = 6;
const SIDEBAR_CHILD_INDENT = 13;
const SIDEBAR_CUSTOM_TRIGGER_CLASS = "sidebar-nav-action-custom-trigger";
const SIDEBAR_COLOR_HEX = {
  [COLORS.BLUE]: "#2185d0",
  [COLORS.GREEN]: "#21ba45",
  [COLORS.RED]: "#db2828",
  [COLORS.ORANGE]: "#f2711c",
  [COLORS.GREY]: "#767676",
  [COLORS.BROWN]: "#a5673f",
  [COLORS.TEAL]: "#00b5ad",
  [COLORS.YELLOW]: "#fbbd08",
};

const getSidebarColor = (color = COLORS.BLUE) => SIDEBAR_COLOR_HEX[color] || SIDEBAR_COLOR_HEX[COLORS.BLUE];
const getSidebarBasicBackground = (color = COLORS.BLUE, hover = false) => {
  const alpha = hover ? "1a" : "10";
  return `${getSidebarColor(color)}${alpha}`;
};

const SidebarActionsList = styled(Flex)`
  width: 100%;
`;

const SidebarActionGroup = styled.div`
  width: 100%;
`;

const SidebarActionButton = styled(Button)`
  &&&&&& {
    width: 100% !important;
    min-width: 35px !important;
    height: ${({ $isOpen, $wrapLabel }) => ($isOpen && $wrapLabel ? "auto" : "36px")} !important;
    min-height: 36px !important;
    display: ${({ $isOpen }) => ($isOpen ? "grid" : "flex")} !important;
    grid-template-columns: ${({ $isOpen }) => ($isOpen ? "34px minmax(0, 1fr) 16px" : "none")};
    align-items: center !important;
    justify-content: ${({ $isOpen }) => ($isOpen ? "stretch" : "center")} !important;
    gap: 0 !important;
    padding: 0 !important;
    margin: 0 !important;
    border-radius: 4px !important;
    text-align: left !important;
    box-shadow: 0 1px 2px 0 rgba(34, 36, 38, .08) !important;
    border: 1px solid ${({ $sidebarColor, $isGroupOpen }) => `${getSidebarColor($sidebarColor)}${$isGroupOpen ? "52" : "26"}`} !important;
    background-color: ${({ $isGroupOpen, $sidebarColor }) => ($isGroupOpen ? `${getSidebarBasicBackground($sidebarColor)} !important` : "#fff !important")};
    color: ${({ $sidebarColor }) => getSidebarColor($sidebarColor)} !important;
    overflow: hidden;
    cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")} !important;
    opacity: ${({ disabled }) => (disabled ? ".58" : "1")} !important;

    &:hover,
    &:focus {
      background-color: ${({ $sidebarColor }) => `${getSidebarBasicBackground($sidebarColor, true)} !important`};
      border-color: ${({ $sidebarColor }) => `${getSidebarColor($sidebarColor)}52 !important`};
    }

    i.icon {
      width: 16px;
      min-width: 16px;
      margin: 0 !important;
    }
  }
`;

const SidebarActionText = styled.span`
  flex: 1;
  min-width: 0;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ${({ $wrapLabel }) => ($wrapLabel ? "clip" : "ellipsis")};
  white-space: ${({ $wrapLabel }) => ($wrapLabel ? "normal" : "nowrap")};
  color: #263238;
  padding: 0 9px;

  ${({ $wrapLabel }) => $wrapLabel && `
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow-wrap: anywhere;
  `}
`;

const SidebarActionIconSlot = styled.span`
  width: 100%;
  min-width: ${({ $child, $isOpen }) => ($isOpen ? ($child ? "32px" : "34px") : "35px")};
  height: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  color: ${({ $sidebarColor }) => getSidebarColor($sidebarColor)};

  i.icon {
    display: block !important;
    width: 16px !important;
    min-width: 16px !important;
    height: 16px !important;
    line-height: 16px !important;
    margin: 0 !important;
    text-align: center !important;
    color: ${({ $sidebarColor }) => getSidebarColor($sidebarColor)} !important;
  }
`;

const SidebarChevron = styled(Icon)`
  &&&& {
    color: ${({ $sidebarColor }) => getSidebarColor($sidebarColor)} !important;
    margin: 0 8px 0 0 !important;
  }
`;

const SidebarChildren = styled.div`
  width: 100%;
  display: grid;
  grid-template-rows: ${({ $open }) => ($open ? "1fr" : "0fr")};
  transition: grid-template-rows ${({ $open }) => ($open ? "0.5s" : "0.3s")} ease;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const SidebarChildrenInner = styled.div`
  min-height: 0;
  overflow: hidden;
`;

const SidebarChildrenList = styled.div`
  width: 100%;
  margin-top: 5px;
  padding-left: 13px;
  display: flex;
  flex-direction: column;
  row-gap: 5px;
`;

const SidebarChildButton = styled(SidebarActionButton)`
  &&&&&& {
    height: ${({ $wrapLabel }) => ($wrapLabel ? "auto" : "32px")} !important;
    min-height: 32px !important;
    display: grid !important;
    grid-template-columns: 32px minmax(0, 1fr);
    align-items: center !important;
    justify-content: stretch !important;
    gap: 0 !important;
    padding: 0 !important;
    font-size: 12.5px !important;
    color: ${({ $sidebarColor }) => getSidebarColor($sidebarColor)} !important;
    background-color: #fff !important;
    background-image: none !important;
    cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")} !important;
    box-sizing: border-box !important;

    &:hover,
    &:focus {
      color: ${({ $sidebarColor }) => getSidebarColor($sidebarColor)} !important;
      background-color: ${({ $sidebarColor }) => `${getSidebarBasicBackground($sidebarColor, true)} !important`};
      border-color: ${({ $sidebarColor }) => `${getSidebarColor($sidebarColor)}52 !important`};
    }

    i.icon {
      justify-self: center;
      color: ${({ $sidebarColor }) => getSidebarColor($sidebarColor)} !important;
      width: 16px;
      min-width: 16px;
      margin: 0 !important;
    }
  }
`;

const SidebarCustomAction = styled.div`
  width: 100%;
  display: flex;
  justify-content: ${({ $isOpen }) => ($isOpen ? "stretch" : "center")};

  > * {
    max-width: 100%;
  }

  &&&&&& .${SIDEBAR_CUSTOM_TRIGGER_CLASS} {
    width: 100% !important;
    min-width: 35px !important;
    height: ${({ $child, $isOpen, $wrapLabel }) => ($isOpen && $wrapLabel ? "auto" : ($child ? "32px" : "36px"))} !important;
    min-height: ${({ $child }) => ($child ? "32px" : "36px")} !important;
    display: ${({ $isOpen }) => ($isOpen ? "grid" : "flex")} !important;
    grid-template-columns: ${({ $child, $isOpen }) => ($isOpen ? `${$child ? "32px" : "34px"} minmax(0, 1fr)` : "none")};
    align-items: center !important;
    justify-content: ${({ $isOpen }) => ($isOpen ? "stretch" : "center")} !important;
    gap: 0 !important;
    padding: 0 !important;
    margin: 0 !important;
    border-radius: 4px !important;
    border: 1px solid ${({ $sidebarColor }) => getSidebarColor($sidebarColor)}26 !important;
    color: #263238 !important;
    background-color: #fff !important;
    background-image: none !important;
    box-shadow: 0 1px 2px 0 rgba(34, 36, 38, .08) !important;
    cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")} !important;
    opacity: ${({ $disabled }) => ($disabled ? ".58" : "1")} !important;
    font-size: ${({ $child }) => ($child ? "12.5px" : "13.5px")} !important;
    text-align: left !important;
    box-sizing: border-box !important;

    &:hover,
    &:focus {
      background-color: ${({ $sidebarColor }) => `${getSidebarBasicBackground($sidebarColor, true)} !important`};
      border-color: ${({ $sidebarColor }) => `${getSidebarColor($sidebarColor)}52 !important`};
    }

    i.icon {
      justify-self: center;
      width: ${({ $child, $isOpen }) => ($isOpen ? ($child ? "32px" : "34px") : "35px")} !important;
      min-width: ${({ $child, $isOpen }) => ($isOpen ? ($child ? "32px" : "34px") : "35px")} !important;
      height: 100% !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      background-color: transparent !important;
      color: ${({ $sidebarColor }) => `${getSidebarColor($sidebarColor)} !important`};
      margin: 0 !important;

      &::before {
        width: 16px;
        min-width: 16px;
      }
    }

    > span {
      display: ${({ $isOpen }) => ($isOpen ? "block" : "none")};
      min-width: 0;
      overflow: hidden;
      text-overflow: ${({ $wrapLabel }) => ($wrapLabel ? "clip" : "ellipsis")};
      white-space: ${({ $wrapLabel }) => ($wrapLabel ? "normal" : "nowrap")};
      line-height: 1.2;
      padding: 0 9px;

      ${({ $wrapLabel }) => $wrapLabel && `
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow-wrap: anywhere;
      `}
    }
  }
`;

const SidebarTooltipTrigger = styled.span`
  display: flex;
  width: ${({ $child }) => `calc(100% + ${($child ? SIDEBAR_HORIZONTAL_INSET + SIDEBAR_CHILD_INDENT : SIDEBAR_HORIZONTAL_INSET) * 2}px)`};
  margin-left: ${({ $child }) => `-${$child ? SIDEBAR_HORIZONTAL_INSET + SIDEBAR_CHILD_INDENT : SIDEBAR_HORIZONTAL_INSET}px`};
  min-height: ${({ $child }) => ($child ? "32px" : "36px")};
  align-items: center;
  justify-content: center;
`;

const SidebarTooltipContent = styled.span`
  display: flex;
  width: 100%;
  padding-left: ${({ $child }) => `${$child ? SIDEBAR_HORIZONTAL_INSET + SIDEBAR_CHILD_INDENT : SIDEBAR_HORIZONTAL_INSET}px`};
  padding-right: ${({ $child }) => `${$child ? SIDEBAR_HORIZONTAL_INSET + SIDEBAR_CHILD_INDENT : SIDEBAR_HORIZONTAL_INSET}px`};
  box-sizing: border-box;
`;

const getActionLabel = (action) => action.text || action.label || action.tooltip;
const getActionItems = (action) => action.items || action.children || [];
const normalizeTooltipText = (text) => typeof text === "string" ? text.trim() : undefined;
const isSameTooltipText = (tooltip, label) => {
  const tooltipText = normalizeTooltipText(tooltip);
  const labelText = normalizeTooltipText(label);

  return !!tooltipText && !!labelText && tooltipText === labelText;
};
const getDisabledActionTooltip = (action, label) => {
  if (!action.disabled) return undefined;

  const tooltip = action.tooltip || action.collapsedTooltip;
  if (!tooltip || isSameTooltipText(tooltip, label)) return undefined;

  return tooltip;
};
const getCollapsedActionTooltip = (action, label) =>
  getDisabledActionTooltip(action, label) || action.collapsedTooltip || action.tooltip || action.text || action.label;
const getForcedExpandedActionTooltip = (action) =>
  action.tooltip || action.collapsedTooltip || action.text || action.label;
const getExpandedActionTooltip = (action, label, isLabelTruncated) =>
  getDisabledActionTooltip(action, label) ||
  (action.showTooltipWhenExpanded ? getForcedExpandedActionTooltip(action) : undefined) ||
  (isLabelTruncated ? label : undefined);
const getActionTestId = (text) => text ? `nav-action-${text.toLowerCase()}` : undefined;
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

const renderSidebarTooltip = (content, trigger, child = false) => {
  if (!content) return trigger;

  return (
    <Popup
      content={content}
      position={POPUP_POSITIONS.LEFT_CENTER}
      size={SIZES.TINY}
      trigger={(
        <SidebarTooltipTrigger $child={child}>
          <SidebarTooltipContent $child={child}>{trigger}</SidebarTooltipContent>
        </SidebarTooltipTrigger>
      )}
    />
  );
};

const SidebarActionWithTooltip = ({
  action,
  buttonProps,
  child = false,
  hasItems,
  isGroupOpen,
  isSidebarOpen,
  disableActionTooltips,
  label,
  sidebarColor,
}) => {
  const labelRef = useRef(null);
  const [isLabelTruncated, setIsLabelTruncated] = useState(false);
  const ActionButton = child ? SidebarChildButton : SidebarActionButton;
  const tooltipContent = isSidebarOpen
    ? getExpandedActionTooltip(action, label, isLabelTruncated)
    : getCollapsedActionTooltip(action, label);
  const resolvedTooltipContent = disableActionTooltips && isSameTooltipText(tooltipContent, label)
    ? undefined
    : tooltipContent;
  const wrapLabel = disableActionTooltips && isSidebarOpen;

  useIsomorphicLayoutEffect(() => {
    if (!isSidebarOpen || !label) {
      setIsLabelTruncated(false);
      return undefined;
    }

    const labelElement = labelRef.current;
    if (!labelElement) return undefined;

    const updateTruncation = () => {
      setIsLabelTruncated(labelElement.scrollWidth > labelElement.clientWidth);
    };

    updateTruncation();

    const resizeObserver = typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(updateTruncation)
      : null;

    resizeObserver?.observe(labelElement);
    window.addEventListener("resize", updateTruncation);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateTruncation);
    };
  }, [isSidebarOpen, label]);

  const button = (
    <ActionButton
      {...buttonProps}
      color={action.color}
      basic={action.basic}
      disabled={action.disabled}
      loading={action.loading}
      $isOpen={isSidebarOpen}
      $isGroupOpen={isGroupOpen}
      $wrapLabel={wrapLabel}
      $sidebarColor={sidebarColor}
      data-testid={getActionTestId(label)}
    >
      {action.icon && (
        <SidebarActionIconSlot $child={child} $isOpen={isSidebarOpen} $sidebarColor={sidebarColor}>
          <Icon name={action.icon} />
        </SidebarActionIconSlot>
      )}
      {isSidebarOpen && label && <SidebarActionText ref={labelRef} $wrapLabel={wrapLabel}>{label}</SidebarActionText>}
      {isSidebarOpen && hasItems && (
        <SidebarChevron
          $sidebarColor={sidebarColor}
          name={isGroupOpen ? ICONS.CARET_UP : ICONS.CARET_DOWN}
        />
      )}
    </ActionButton>
  );

  return renderSidebarTooltip(resolvedTooltipContent, button, child);
};

const NavActions = ({ orientation, variant = NAV_ACTION_VARIANTS.HORIZONTAL, isOpen = false, onRequestOpen, disableActionTooltips = false }) => {
  const { actions } = useNavActionsContext();
  const resolvedVariant = orientation === "vertical" ? NAV_ACTION_VARIANTS.SIDEBAR_EXPANDED : variant;
  const isSidebar = resolvedVariant !== NAV_ACTION_VARIANTS.HORIZONTAL;
  const isSidebarOpen = resolvedVariant === NAV_ACTION_VARIANTS.SIDEBAR_EXPANDED || isOpen;
  const [openActionId, setOpenActionId] = useState(null);

  const renderSidebarButton = (action, child = false, parentColor) => {
    const label = getActionLabel(action);
    const items = getActionItems(action);
    const hasItems = items.length > 0;
    const sidebarColor = action.color || parentColor || COLORS.BLUE;
    const customButton = isValidElement(action.button)
      ? cloneElement(action.button, { triggerClassName: SIDEBAR_CUSTOM_TRIGGER_CLASS })
      : action.button;

    if (action.button && !hasItems) {
      const tooltipContent = isSidebarOpen
        ? getExpandedActionTooltip(action, label, false)
        : getCollapsedActionTooltip(action, label);
      const resolvedTooltipContent = disableActionTooltips && isSameTooltipText(tooltipContent, label)
        ? undefined
        : tooltipContent;

      return renderSidebarTooltip(
        resolvedTooltipContent,
        (
        <SidebarCustomAction
          $child={child}
          $disabled={action.disabled}
          $isOpen={isSidebarOpen}
          $wrapLabel={disableActionTooltips && isSidebarOpen}
          $sidebarColor={sidebarColor}
        >
          {customButton}
        </SidebarCustomAction>
        ),
        child
      );
    }

    const handleClick = () => {
      if (hasItems) {
        if (!isSidebarOpen) {
          onRequestOpen?.();
          setOpenActionId(action.id);
          return;
        }

        setOpenActionId((currentId) => currentId === action.id ? null : action.id);
        return;
      }

      action.onClick?.();
    };

    const buttonProps = action.href
      ? { as: "a", href: action.href, target: action.target, rel: action.target === "_blank" ? "noreferrer" : undefined }
      : { type: "button", onClick: handleClick };

    return (
      <SidebarActionWithTooltip
        action={action}
        buttonProps={buttonProps}
        child={child}
        hasItems={hasItems}
        isGroupOpen={hasItems && openActionId === action.id}
        isSidebarOpen={isSidebarOpen}
        disableActionTooltips={disableActionTooltips}
        label={label}
        sidebarColor={sidebarColor}
      />
    );
  };

  const renderSidebarAction = (action) => {
    const items = getActionItems(action);

    return (
      <SidebarActionGroup>
        {renderSidebarButton(action)}
        {isSidebarOpen && !!items.length && (
          <SidebarChildren $open={openActionId === action.id}>
            <SidebarChildrenInner>
              <SidebarChildrenList>
                {items.map((item) => (
                  <Box key={`action_${action.id}_child_${item.id}`}>
                    {renderSidebarButton(item, true, action.color)}
                  </Box>
                ))}
              </SidebarChildrenList>
            </SidebarChildrenInner>
          </SidebarChildren>
        )}
        {action.modal}
      </SidebarActionGroup>
    );
  };

  if (isSidebar) {
    return (
      <SidebarActionsList
        $rowGap="7px"
        $alignItems="stretch"
        $flexDirection="column"
        role="toolbar"
        aria-orientation="vertical"
      >
        {actions.map((action) => (
          <Box key={`action_${action.id}`}>
            {renderSidebarAction(action)}
          </Box>
        ))}
      </SidebarActionsList>
    );
  }

  return (
    <>
      <Flex
        $columnGap="10px"
        $alignItems="center"
      >
        {actions.map(({ id, icon, color, onClick, text, button, disabled, width, basic, loading, tooltip, iconOnly, popupPosition }) => {
          const popupContent = tooltip ? (
            <div>
              <div><strong>{text}</strong></div>
              <div>{tooltip}</div>
            </div>
          ) : text;

          return (
            <Box key={`action_${id}`}>
              {button ? button : (
                <IconedButton
                  text={text}
                  icon={icon}
                  color={color}
                  basic={basic}
                  onClick={onClick}
                  width={width}
                  disabled={disabled}
                  loading={loading}
                  iconOnly={iconOnly}
                  popupContent={popupContent}
                  popupPosition={popupPosition}
                  dataTestId={getActionTestId(text)}
                />
              )}
            </Box>
          );
        })}
      </Flex>
    </>
  );
};


export { NavActions, NavActionsProvider, useNavActionsContext };

