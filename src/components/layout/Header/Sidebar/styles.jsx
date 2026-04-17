import { Button } from "semantic-ui-react";
import styled, { css } from "styled-components";

import Link from "next/link";

export const SidebarContainer = styled.aside`
  position: fixed;
  top: 0;
  left: 0;
  width: 300px;
  height: 100vh;
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  box-shadow: 8px 0 30px rgba(0, 0, 0, 0.08);
  z-index: 900;
  transform: translateX(-100%);
  transition: transform 0.25s ease;
  display: flex;
  flex-direction: column;

  ${({ $open }) =>
    $open &&
    css`
      transform: translateX(0);
    `}
`;

export const SidebarHeader = styled.div`
  height: 64px;
  min-height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 18px;
  border-bottom: 1px solid #e5e7eb;
  background: #2185d0;
`;

export const SidebarBody = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 10px 0;
`;

export const SidebarTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  color: #fff;
`;

export const CloseButton = styled(Button)`
  border: none;
  background: transparent;
  font-size: 14px;
  cursor: pointer;
  padding: 0;
  margin: 0!important;

  i{
    margin: 0;
  }
`;

export const NavSection = styled.div`
  display: flex;
  flex-direction: column;
`;

export const NavItemButton = styled(Link)`
  min-height: 44px;
  width: 100%;
  background: ${({ $active }) => ($active ? "#eef4ff" : "transparent")};
  color: ${({ $active }) => ($active ? "#2185d0" : "#1f2937")};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px 0 18px;
  cursor: pointer;
  transition: 0.2s ease;
  text-decoration: none;

  &:hover {
    background: ${({ $active }) => ($active ? "#eef4ff" : "#E2E8F2")};
  }
`;

export const NavItemRow = styled.div`
  min-height: 44px;
  width: 100%;
  background: ${({ $active }) => ($active ? "#eef4ff" : "transparent")};
  color: ${({ $active }) => ($active ? "#2185d0" : "#1f2937")};
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  transition: 0.2s ease;

  &:hover {
    background: ${({ $active }) => ($active ? "#eef4ff" : "#E2E8F2")};
  }
`;

export const NavItemMain = styled(Link)`
  flex: 1;
  min-height: 44px;
  background: transparent;
  cursor: pointer;
  text-align: left;
  padding: 0 0 0 18px;
  display: flex;
  align-items: center;
  color: ${({ $active }) => ($active ? "#2185d0" : "#1f2937")};
  text-decoration: none;
`;

export const NavItemToggle = styled.button`
  min-height: 44px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1px 28px 1px 28px;

  &:hover {
    background: rgba(0, 0, 0, 0.04);
  }
`;

export const NavItemContent = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const NavLabel = styled.span`
  font-size: 14px;
  font-weight: 600;
`;

export const Chevron = styled.span`
  font-size: 14px;
  transition: transform 0.3s ease;
  transform: rotate(${({ $open }) => ($open ? "180deg" : "0deg")});

  i {
    margin: 0!important;
  }
`;

export const Submenu = styled.div`
  display: grid;
  grid-template-rows: ${({ $open }) => ($open ? "1fr" : "0fr")};
  transition: grid-template-rows ${({ $open }) => ($open ? "0.5s" : "0.3s")} ease;
`;

export const SubmenuInner = styled.div`
  overflow: hidden;
`;

export const SubmenuItem = styled(Link)`
  min-height: 38px;
  width: 100%;
  padding: 0px 25px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${({ $active }) => ($active ? "#eef4ff" : "transparent")};
  color: ${({ $active }) => ($active ? "#2185d0" : "#4b5563")};
  cursor: pointer;
  text-decoration: none;

  &:hover {
    background: #E2E8F2;
  }
`;

export const Badge = styled.span`
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 999px;
  background: #dbeafe;
  color: #1d4ed8;
`;