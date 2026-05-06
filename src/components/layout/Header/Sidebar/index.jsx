'use client';

import { COLORS, ICONS, SHORTKEYS } from "@/common/constants";
import { useKeyboardShortcuts } from "@/hooks";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Icon } from "semantic-ui-react";
import {
  Badge,
  Chevron,
  CloseButton,
  NavItemButton,
  NavItemContent,
  NavItemMain,
  NavItemRow,
  NavItemToggle,
  NavLabel,
  NavSection,
  SidebarBody,
  SidebarContainer,
  SidebarHeader,
  SidebarTitle,
  Submenu,
  SubmenuInner,
  SubmenuItem
} from "./styles";

const SidebarNavigation = ({ open, onClose, items = [], pathname }) => {
  const [openGroups, setOpenGroups] = useState({});
  const searchParams = useSearchParams();

  const handleClose = () => {
    setOpenGroups({});
    onClose?.();
  };

  const toggleGroup = (id) => {
    setOpenGroups((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  useKeyboardShortcuts([
    {
      key: SHORTKEYS.ESCAPE,
      action: () => handleClose(),
      condition: () => open,
    },
  ]);

  const handleLinkClick = () => {
    handleClose();
  };

  const isItemActive = (href) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const isSubItemActive = (href) => {
    if (!href) return false;

    const [targetPath, targetQuery] = href.split("?");

    if (pathname !== targetPath) return false;

    if (!targetQuery) return true;

    const targetParams = new URLSearchParams(targetQuery);
    const currentParams = new URLSearchParams(searchParams.toString());

    return [...targetParams.entries()].every(
      ([key, value]) => currentParams.get(key) === value
    );
  };

  const isGroupActive = (children = []) =>
    children.some((child) => isSubItemActive(child.href));

  return (
    <SidebarContainer $open={open}>
      <SidebarHeader>
        <SidebarTitle>Menú</SidebarTitle>
        <CloseButton icon color={COLORS.BLUE} onClick={handleClose}>
          <Icon name={ICONS.CANCEL} />
        </CloseButton>
      </SidebarHeader>
      <SidebarBody>
        <NavSection>
          {items.map((item) => {
            const hasChildren = !!item.children?.length;
            const expanded = !!openGroups[item.id];
            const active = hasChildren
              ? isGroupActive(item.children)
              : isItemActive(item.href);
            if (hasChildren) {
              return (
                <div key={item.id}>
                  <NavItemRow $active={active}>
                    <NavItemMain
                      href={item.href || item.children?.[0]?.href}
                      $active={active}
                      onClick={handleLinkClick}
                    >
                      <NavLabel>{item.label}</NavLabel>
                    </NavItemMain>

                    <NavItemToggle
                      type="button"
                      onClick={() => toggleGroup(item.id)}
                      aria-label={expanded ? "Ocultar opciones" : "Mostrar opciones"}
                    >
                      <Chevron $open={expanded}>
                        <Icon name={ICONS.CARET_UP} />
                      </Chevron>
                    </NavItemToggle>
                  </NavItemRow>
                  <Submenu $open={expanded}>
                    <SubmenuInner>
                      {item.children.map((child) => (
                        <SubmenuItem
                          key={child.id}
                          href={child.href}
                          $active={isSubItemActive(child.href)}
                          onClick={handleLinkClick}
                        >
                          <span>{child.label}</span>
                          {child.badge && <Badge>{child.badge}</Badge>}
                        </SubmenuItem>
                      ))}
                    </SubmenuInner>
                  </Submenu>
                </div>
              );
            }
            return (
              <NavItemButton
                key={item.id}
                href={item.href}
                $active={active}
                onClick={handleLinkClick}
              >
                <NavItemContent>
                  <NavLabel>{item.label}</NavLabel>
                </NavItemContent>
                {item.badge && <Badge>{item.badge}</Badge>}
              </NavItemButton>
            );
          })}
        </NavSection>
      </SidebarBody>
    </SidebarContainer>
  );
};

export default SidebarNavigation;