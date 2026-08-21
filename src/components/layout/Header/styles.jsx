import styled from "styled-components";

const MOBILE_BREAKPOINT = 767;
const MOBILE_HORIZONTAL_PADDING = 16;

export const HeaderBar = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: rgb(243, 244, 246);
  border-bottom: 1px solid #e7e7e7;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 50px;
  z-index: 800;
  min-width: 0;

  @media (max-width: ${MOBILE_BREAKPOINT}px) {
    padding-left: ${MOBILE_HORIZONTAL_PADDING}px;
    padding-right: ${MOBILE_HORIZONTAL_PADDING}px;
  }
`;

export const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;

  @media (max-width: ${MOBILE_BREAKPOINT}px) {
    flex: 1 1 auto;
    gap: 8px;
  }
`;

export const MenuSlot = styled.div`
  flex: 0 0 110px;
  width: 110px;
  height: 35px;
  display: flex;
  align-items: center;
`;

export const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;

  @media (max-width: ${MOBILE_BREAKPOINT}px) {
    flex: 0 1 auto;
    gap: 8px;
    justify-content: flex-end;
  }
`;

export const HamburgerButton = styled.button`
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 4px;
  background: #f4f6f8;
  cursor: pointer;
  font-size: 20px;
  transition: 0.2s ease;

  &:hover {
    background: #e9eef3;
  }
`;

export const Brand = styled.img`
  display: block;
  height: 50px;
  width: auto;
  max-width: 150px;
  flex-shrink: 0;
  min-width: 0;

  @media (max-width: ${MOBILE_BREAKPOINT}px) {
    height: 38px;
    max-width: 132px;
  }
`;

export const RightActions = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 0 0 auto;

  @media (max-width: ${MOBILE_BREAKPOINT}px) {
    gap: 6px;
  }
`;

export const AccountBadge = styled.div`
  height: 35px;
  padding: 0 14px;
  border-radius: 4px;
  background: #2185d0;
  color: #ffffff;
  display: flex;
  align-items: center;
  font-size: 13.5px;
  min-width: 0;
  white-space: nowrap;

  @media (max-width: ${MOBILE_BREAKPOINT}px) {
    max-width: 72px;
    padding: 0 8px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

export const InfoMenuAccount = styled.div`
  padding: 14px 16px;
  border-bottom: 1px solid #e5e7eb;
  min-width: 0;
`;

export const InfoMenuAccountLabel = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  margin-bottom: 5px;
`;

export const InfoMenuAccountValue = styled.div`
  color: #2185d0;
  font-size: 14px;
  font-weight: 700;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const UserButton = styled.button`
  height: 35px;
  padding: 0 14px;
  border: none;
  border-radius: 4px;
  background: #2185d0;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size:13.5px;
  color: rgb(255, 255, 255);
  transition: opacity .1s ease, background-color .1s ease, color .1s ease, box-shadow .1s ease, background .1s ease;

  &:hover {
    background: #0d71bb;
  }
`;

export const UserIcon = styled.span`
  font-size: 16px;
`;

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.28);
  z-index: 790;
`;

export const HeaderDesktopOnly = styled.div`
  display: contents;

  @media (max-width: ${MOBILE_BREAKPOINT}px) {
    display: none;
  }
`;

export const HeaderMobileOnly = styled.div`
  display: none;

  @media (max-width: ${MOBILE_BREAKPOINT}px) {
    display: contents;
  }
`;
