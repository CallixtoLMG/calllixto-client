import styled from "styled-components";

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
`;

export const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

export const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
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

export const Brand = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
`;

export const RightActions = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
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

