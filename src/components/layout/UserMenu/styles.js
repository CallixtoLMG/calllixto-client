import { CONTENT_SIZES } from "@/common/constants";
import styled, { css } from "styled-components";

export const MenuContainer = styled.div`
  position: relative;
  display: inline-flex;
`;

export const MenuCard = styled.div`
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 320px;
  max-height: 70vh;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  box-shadow: 8px 12px 30px rgba(0, 0, 0, 0.12);
  z-index: 1300;
  overflow: hidden;

  opacity: ${({ $open }) => ($open ? 1 : 0)};
  transform: ${({ $open }) =>
    $open ? "translateY(0) scale(1)" : "translateY(-6px) scale(0.98)"};
  visibility: ${({ $open }) => ($open ? "visible" : "hidden")};
  pointer-events: ${({ $open }) => ($open ? "auto" : "none")};

  transition:
    opacity 0.18s ease,
    transform 0.18s ease,
    visibility 0.18s ease;
`;

export const MenuHeader = styled.div`
  padding: 16px 16px 14px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  row-gap: 6px;
`;

export const UserName = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
`;

export const UserMeta = styled.div`
  font-size: 13.5px;
  color: #6b7280;
  display: flex;
  flex-direction: column;
`;

export const SelectedAccountText = styled.span`
  color: #2185d0;
  font-weight: 600;
`;

export const MenuBody = styled.div`
  padding: 10px 0;
  padding: ${({ $view }) => ($view ? "10px" : "10px 0")};
`;

export const MenuActions = styled.div`
  display: flex;
  flex-direction: column;
`;

export const MenuAction = styled.button`
  width: 100%;
  min-height: 44px;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 10px 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: background 0.2s ease, color 0.2s ease;

  span {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    font-weight: 600;
  }

  &:hover {
    background: #E2E8F2;
  }

  ${({ $danger }) =>
    $danger &&
    css`
      color: #dc2626;

      &:hover {
        background: #fef2f2;
      }
    `}
`;

export const BackButton = styled.button`
  width: ${CONTENT_SIZES.FIT};
  border: none;
  background: transparent;
  color: #2185d0;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
`;

export const MenuSectionLabel = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  margin-bottom: 10px;
`;

export const SearchWrapper = styled.div`
  margin-bottom: 10px;
`;

export const SearchInput = styled.input`
  width: 100%;
  height: 40px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 0 12px;
  outline: none;
  font-size: 14px;
  color: #1f2937;
  background: #ffffff;

  &:focus {
    border-color: #60a5fa;
    box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.18);
  }
`;

export const AccountList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 260px;
  overflow-y: auto;
  padding-right: 2px;
  scrollbar-width: thin;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 999px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }
`;

export const AccountItem = styled.button`
  width: 100%;
  min-height: 42px;
  border: none;
  border-radius: 4px;
  background: ${({ $active }) => ($active ? "#eef4ff" : "transparent")};
  color: ${({ $active }) => ($active ? "#2185d0" : "#1f2937")};
  cursor: pointer;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: background 0.2s ease, color 0.2s ease;
  text-align: left;
  font-size: 14px;
  font-weight: 600;

  &:hover {
    background: ${({ $active }) => ($active ? "#eef4ff" : "#f6f7f9")};
  }
`;

export const EmptyState = styled.div`
  min-height: 60px;
  display: flex;
  align-items: center;
  color: #6b7280;
  font-size: 14px;
  padding: 0 4px;
`;
