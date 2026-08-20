"use client";
import { UserProvider } from "@/User";
import { RouteHistoryProvider } from "@/app/RouteHistoryContext";
import { BackToListButton, GoBackButton } from "@/common/components/buttons";
import { COLORS, ICONS, PAGES, POPUP_POSITIONS, SIZES } from "@/common/constants";
import { BreadcrumProvider, Breadcrumb, Header, NavActions, NavActionsProvider, useNavActionsContext } from "@/components/layout";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon, Popup } from "semantic-ui-react";
import styled from "styled-components";
import { LayoutChildrenContainer } from "../stylesLayout";

const HEADER_HEIGHT = 64;
const LEGACY_NAVIGATION_TOP = 60;
const BREADCRUMB_CONTROL_HEIGHT = 35;
const BREADCRUMB_VERTICAL_PADDING = 20;
const BREADCRUMB_BORDER_HEIGHT = 1;
const PAGE_WORKSPACE_TOP_GAP = 10;
const NAVIGATION_HORIZONTAL_PADDING = 50;
const MOBILE_BREAKPOINT = 767;
const MOBILE_NAVIGATION_HORIZONTAL_PADDING = 8;
const PAGE_ACTIONS_WIDTH = 220;
const MOBILE_PAGE_ACTIONS_WIDTH = `min(320px, calc(100vw - ${MOBILE_NAVIGATION_HORIZONTAL_PADDING * 2}px))`;
const PAGE_ACTIONS_COLLAPSED_WIDTH = 48;
const PAGE_ACTIONS_GAP = 8;
const BREADCRUMB_HEIGHT = BREADCRUMB_CONTROL_HEIGHT + BREADCRUMB_VERTICAL_PADDING + BREADCRUMB_BORDER_HEIGHT;
const PILOT_CONTENT_TOP = HEADER_HEIGHT + BREADCRUMB_HEIGHT;
const PILOT_STICKY_TOP = PILOT_CONTENT_TOP + PAGE_WORKSPACE_TOP_GAP;
const MOBILE_ACTIONS_RAIL_QUERY = `(max-width: ${MOBILE_BREAKPOINT}px)`;

const NavigationContainer = styled.div`
  position: fixed;
  top: ${({ $top = LEGACY_NAVIGATION_TOP }) => `${$top}px`};
  padding: 10px ${NAVIGATION_HORIZONTAL_PADDING}px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  column-gap: 20px;
  background-color: #fff;
  width: 100%;
  border-bottom: 1px solid #ddd;
  z-index: 3;
  min-width: 0;

  @media (max-width: ${MOBILE_BREAKPOINT}px) {
    padding-left: ${MOBILE_NAVIGATION_HORIZONTAL_PADDING}px;
    padding-right: ${MOBILE_NAVIGATION_HORIZONTAL_PADDING}px;
  }
`;

const BreadcrumbContainer = styled.div`
  display: flex;
  align-items: center;
  column-gap: 10px;
  min-width: 0;
  max-width: 100%;
`;

const PageWorkspace = styled.div`
  display: grid;
  grid-template-columns: ${({ $hasActions }) => ($hasActions ? `minmax(0, 1fr) ${PAGE_ACTIONS_COLLAPSED_WIDTH}px` : "minmax(0, 1fr)")};
  column-gap: ${({ $hasActions }) => ($hasActions ? `${PAGE_ACTIONS_GAP}px` : "0")};
  align-items: start;
  padding: ${PILOT_STICKY_TOP}px ${({ $hasActions }) => ($hasActions ? `${MOBILE_NAVIGATION_HORIZONTAL_PADDING}px` : `${NAVIGATION_HORIZONTAL_PADDING}px`)} 20px ${NAVIGATION_HORIZONTAL_PADDING}px;
  width: 100%;
  min-width: 0;
  min-height: 80vh;

  @media (max-width: ${MOBILE_BREAKPOINT}px) {
    grid-template-columns: ${({ $hasActions, $isActionsRailOpen }) => ($hasActions && !$isActionsRailOpen ? `minmax(0, 1fr) ${PAGE_ACTIONS_COLLAPSED_WIDTH}px` : "minmax(0, 1fr)")};
    column-gap: ${({ $hasActions, $isActionsRailOpen }) => ($hasActions && !$isActionsRailOpen ? `${PAGE_ACTIONS_GAP}px` : "0")};
    padding: ${PILOT_STICKY_TOP}px ${({ $hasActions, $isActionsRailOpen }) => ($hasActions && !$isActionsRailOpen ? `${PAGE_ACTIONS_GAP}px` : `${MOBILE_NAVIGATION_HORIZONTAL_PADDING}px`)} 20px ${MOBILE_NAVIGATION_HORIZONTAL_PADDING}px;
  }
`;

const PageContent = styled.div`
  min-width: 0;
  width: 100%;
`;

const PageActionsRail = styled.aside`
  position: sticky;
  top: ${PILOT_STICKY_TOP}px;
  width: ${PAGE_ACTIONS_COLLAPSED_WIDTH}px;
  justify-self: end;
  z-index: 4;
  min-width: 0;

  @media (max-width: ${MOBILE_BREAKPOINT}px) {
    position: fixed;
    right: ${({ $isOpen }) => ($isOpen ? `${MOBILE_NAVIGATION_HORIZONTAL_PADDING}px` : `${PAGE_ACTIONS_GAP}px`)};
    width: ${PAGE_ACTIONS_COLLAPSED_WIDTH}px;
  }
`;

const PageActionsSurface = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  width: ${({ $isOpen }) => ($isOpen ? `${PAGE_ACTIONS_WIDTH}px` : `${PAGE_ACTIONS_COLLAPSED_WIDTH}px`)};
  overflow: visible;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 1px 2px 0 rgba(34, 36, 38, .12);
  transition: width 160ms ease;

  @media (max-width: ${MOBILE_BREAKPOINT}px) {
    width: ${({ $isOpen }) => ($isOpen ? MOBILE_PAGE_ACTIONS_WIDTH : `${PAGE_ACTIONS_COLLAPSED_WIDTH}px`)};
  }
`;

const PageActionsToggle = styled.button`
  width: 100%;
  height: 42px;
  border: 0;
  border-bottom: 1px solid #e6e6e6;
  border-radius: 6px 6px 0 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ $isOpen }) => ($isOpen ? "#f8f8f8" : "#fff")};
  color: #555;
  cursor: pointer;

  &:hover,
  &:focus-visible {
    background-color: #f5f5f5;
    outline: none;
  }

  i.icon {
    color: inherit;
    margin: 0 !important;
  }
`;

const PageActionsTooltipTrigger = styled.span`
  display: flex;
  width: 100%;
  height: 42px;
  align-items: center;
  justify-content: center;
`;

const PageActionsContent = styled.div`
  width: 100%;
  padding: 8px 6px 10px;
  max-height: calc(100vh - ${PILOT_STICKY_TOP}px - 42px - 12px);
  overflow-x: hidden;
  overflow-y: auto;
`;

const useIsMobileActionsRail = () => {
  const [isMobileActionsRail, setIsMobileActionsRail] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_ACTIONS_RAIL_QUERY);
    const updateIsMobileActionsRail = () => setIsMobileActionsRail(mediaQuery.matches);

    updateIsMobileActionsRail();
    mediaQuery.addEventListener("change", updateIsMobileActionsRail);

    return () => mediaQuery.removeEventListener("change", updateIsMobileActionsRail);
  }, []);

  return isMobileActionsRail;
};

const PrivateLayoutContent = ({ children }) => {
  const pathname = usePathname();
  const { actions } = useNavActionsContext();
  const [isActionsRailOpen, setIsActionsRailOpen] = useState(false);
  const isMobileActionsRail = useIsMobileActionsRail();
  const hide = [PAGES.BASE, PAGES.NOT_FOUND.BASE];
  const show = !hide.includes(pathname);
  const hasActions = actions.length > 0;
  const actionsRailToggle = (
    <PageActionsTooltipTrigger>
      <PageActionsToggle
        $isOpen={isActionsRailOpen}
        type="button"
        aria-label={isActionsRailOpen ? "Ocultar acciones" : "Mostrar acciones"}
        aria-expanded={isActionsRailOpen}
        data-testid="page-actions-rail-toggle"
        onClick={() => setIsActionsRailOpen((current) => !current)}
      >
        <Icon aria-hidden="true" name={ICONS.LIST_UL} color={COLORS.BLUE} />
      </PageActionsToggle>
    </PageActionsTooltipTrigger>
  );

  useEffect(() => {
    setIsActionsRailOpen(false);
  }, [pathname]);

  if (!show) {
    return (
      <LayoutChildrenContainer>
        {children}
      </LayoutChildrenContainer>
    );
  }

  return (
    <>
      <NavigationContainer>
        <BreadcrumbContainer>
          <GoBackButton />
          <BackToListButton />
          <Breadcrumb />
        </BreadcrumbContainer>
      </NavigationContainer>
      <PageWorkspace $hasActions={hasActions} $isActionsRailOpen={isActionsRailOpen}>
        <PageContent>
          {children}
        </PageContent>
        {hasActions && (
          <PageActionsRail $isOpen={isActionsRailOpen} aria-label="Acciones de pagina" data-testid="page-actions-aside">
            <PageActionsSurface $isOpen={isActionsRailOpen}>
              {isMobileActionsRail ? actionsRailToggle : (
                <Popup
                  content={isActionsRailOpen ? "Ocultar acciones" : "Mostrar acciones"}
                  position={POPUP_POSITIONS.LEFT_CENTER}
                  size={SIZES.TINY}
                  trigger={actionsRailToggle}
                />
              )}
              <PageActionsContent>
                <NavActions
                  variant={isActionsRailOpen ? "sidebar-expanded" : "sidebar-collapsed"}
                  isOpen={isActionsRailOpen}
                  disableActionTooltips={isMobileActionsRail}
                  onRequestOpen={() => setIsActionsRailOpen(true)}
                />
              </PageActionsContent>
            </PageActionsSurface>
          </PageActionsRail>
        )}
      </PageWorkspace>
    </>
  );
};

const PrivateLayout = ({ children }) => {
  const pathname = usePathname();

  return (
    <UserProvider>
      <RouteHistoryProvider>
        <NavActionsProvider>
          <Header />
          <BreadcrumProvider pathname={pathname}>
            <PrivateLayoutContent>
              {children}
            </PrivateLayoutContent>
          </BreadcrumProvider>
        </NavActionsProvider>
      </RouteHistoryProvider>
    </UserProvider>
  );
};

export default PrivateLayout;
