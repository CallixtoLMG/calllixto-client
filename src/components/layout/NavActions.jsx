import { Box, Button, Flex, Icon } from '@/common/components/custom';
import { COLORS, ICONS, POPUP_POSITIONS, SIZES } from '@/common/constants';
import { cloneElement, createContext, isValidElement, useContext, useState } from 'react';
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
  const alpha = hover ? "1f" : "12";
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
    height: 36px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: ${({ $isOpen }) => ($isOpen ? "flex-start" : "center")} !important;
    gap: ${({ $isOpen }) => ($isOpen ? "8px" : "0")} !important;
    padding: ${({ $isOpen }) => ($isOpen ? "0 10px !important" : "0 !important")};
    margin: 0 !important;
    border-radius: 4px !important;
    text-align: left !important;
    box-shadow: ${({ basic }) => (basic ? "none" : "0 1px 2px 0 rgba(34, 36, 38, .15)")} !important;
    border: ${({ basic, $sidebarColor }) => (basic ? `1px solid ${getSidebarColor($sidebarColor)} !important` : undefined)};
    background-color: ${({ basic, $sidebarColor }) => (basic ? `${getSidebarBasicBackground($sidebarColor)} !important` : undefined)};

    &:hover,
    &:focus {
      background-color: ${({ basic, $sidebarColor }) => (basic ? `${getSidebarBasicBackground($sidebarColor, true)} !important` : undefined)};
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
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const SidebarActionIconSlot = styled.span`
  width: ${({ $child }) => ($child ? "28px" : "16px")};
  min-width: ${({ $child }) => ($child ? "28px" : "16px")};
  height: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;

  i.icon {
    display: block !important;
    width: 16px !important;
    min-width: 16px !important;
    height: 16px !important;
    line-height: 16px !important;
    margin: 0 !important;
    text-align: center !important;
  }
`;

const SidebarChevron = styled(Icon)`
  &&&& {
    color: white !important;
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
    height: 32px !important;
    display: grid !important;
    grid-template-columns: 28px minmax(0, 1fr);
    align-items: center !important;
    justify-content: stretch !important;
    gap: 0 !important;
    padding: 0 10px !important;
    font-size: 12.5px !important;
    color: ${({ disabled }) => (disabled ? "rgba(255, 255, 255, .72)" : "white")} !important;
    background-color: ${({ $sidebarColor, disabled }) => (disabled ? "#e0e1e2" : getSidebarColor($sidebarColor))} !important;
    background-image: linear-gradient(rgba(255, 255, 255, .14), rgba(255, 255, 255, .14)) !important;
    cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")} !important;
    box-sizing: border-box !important;
    transition: background-image 120ms ease;

    &:hover,
    &:focus {
      color: ${({ disabled }) => (disabled ? "rgba(255, 255, 255, .72)" : "white")} !important;
      background-image: linear-gradient(rgba(255, 255, 255, .2), rgba(255, 255, 255, .2)) !important;
    }

    i.icon {
      justify-self: center;
      color: white !important;
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
    height: ${({ $child }) => ($child ? "32px" : "36px")} !important;
    display: ${({ $child }) => ($child ? "grid" : "flex")} !important;
    grid-template-columns: ${({ $child }) => ($child ? "28px minmax(0, 1fr)" : "none")};
    align-items: center !important;
    justify-content: ${({ $child, $isOpen }) => ($child ? "stretch" : ($isOpen ? "flex-start" : "center"))} !important;
    gap: ${({ $child, $isOpen }) => ($child ? "0" : ($isOpen ? "8px" : "0"))} !important;
    padding: ${({ $isOpen }) => ($isOpen ? "0 10px !important" : "0 !important")};
    margin: 0 !important;
    border-radius: 4px !important;
    border: 0 !important;
    color: ${({ $disabled }) => ($disabled ? "rgba(255, 255, 255, .72)" : "white")} !important;
    background-color: ${({ $sidebarColor, $disabled }) => ($disabled ? "#e0e1e2" : getSidebarColor($sidebarColor))} !important;
    background-image: linear-gradient(rgba(255, 255, 255, .14), rgba(255, 255, 255, .14)) !important;
    box-shadow: ${({ $child }) => ($child ? "0 1px 2px 0 rgba(34, 36, 38, .15)" : "none")} !important;
    cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")} !important;
    font-size: ${({ $child }) => ($child ? "12.5px" : "13.5px")} !important;
    text-align: left !important;
    box-sizing: border-box !important;
    transition: background-image 120ms ease;

    i.icon {
      justify-self: center;
      width: 16px;
      min-width: 16px;
      color: white !important;
      margin: 0 !important;
    }

    > span {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      line-height: 1.2;
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
const getCollapsedActionTooltip = (action) => action.collapsedTooltip || action.tooltip || action.text || action.label;
const getActionTestId = (text) => text ? `nav-action-${text.toLowerCase()}` : undefined;

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

const NavActions = ({ orientation, variant = NAV_ACTION_VARIANTS.HORIZONTAL, isOpen = false, onRequestOpen }) => {
  const { actions } = useNavActionsContext();
  const resolvedVariant = orientation === "vertical" ? NAV_ACTION_VARIANTS.SIDEBAR_EXPANDED : variant;
  const isSidebar = resolvedVariant !== NAV_ACTION_VARIANTS.HORIZONTAL;
  const isSidebarOpen = resolvedVariant === NAV_ACTION_VARIANTS.SIDEBAR_EXPANDED || isOpen;
  const [openActionId, setOpenActionId] = useState(null);

  const renderSidebarButton = (action, child = false, parentColor) => {
    const label = getActionLabel(action);
    const collapsedTooltip = getCollapsedActionTooltip(action);
    const items = getActionItems(action);
    const hasItems = items.length > 0;
    const ActionButton = child ? SidebarChildButton : SidebarActionButton;
    const sidebarColor = action.color || parentColor || COLORS.BLUE;
    const customButton = isValidElement(action.button)
      ? cloneElement(action.button, { triggerClassName: SIDEBAR_CUSTOM_TRIGGER_CLASS })
      : action.button;

    if (action.button && !hasItems) {
      return renderSidebarTooltip(collapsedTooltip, (
        <SidebarCustomAction
          $child={child}
          $disabled={action.disabled}
          $isOpen={isSidebarOpen}
          $sidebarColor={sidebarColor}
        >
          {customButton}
        </SidebarCustomAction>
      ), child);
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

    const button = (
      <ActionButton
        {...buttonProps}
        color={action.color}
        basic={action.basic}
        disabled={action.disabled}
        loading={action.loading}
        $isOpen={isSidebarOpen}
        $sidebarColor={sidebarColor}
        data-testid={getActionTestId(label)}
      >
        {action.icon && (
          <SidebarActionIconSlot $child={child}>
            <Icon name={action.icon} color={action.basic ? action.color : undefined} />
          </SidebarActionIconSlot>
        )}
        {isSidebarOpen && label && <SidebarActionText>{label}</SidebarActionText>}
        {isSidebarOpen && hasItems && (
          <SidebarChevron
            name={openActionId === action.id ? ICONS.CARET_UP : ICONS.CARET_DOWN}
          />
        )}
      </ActionButton>
    );

    return renderSidebarTooltip(collapsedTooltip, button, child);
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

