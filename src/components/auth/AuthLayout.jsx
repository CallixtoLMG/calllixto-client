"use client";

import Image from "next/image";
import styled from "styled-components";
import { AUTH_BACKGROUND_COLOR } from "./constants";

const AuthPage = styled.main`
  min-height: ${({ $variant }) => ($variant === "embedded" ? "calc(100vh - 150px)" : "100vh")};
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ $variant }) => ($variant === "embedded" ? "0 16px 20px" : "32px 16px")};
  background: ${AUTH_BACKGROUND_COLOR};

  @media (max-width: 600px) {
    ${({ $variant }) => $variant === "embedded" && `
      width: calc(100vw - 32px);
      margin-left: calc((100% - (100vw - 32px)) / 2);
      padding: 0 0 16px;
    `}
  }
`;

const AuthCard = styled.section`
  width: 100%;
  max-width: ${({ $maxWidth = "440px" }) => $maxWidth};
  padding: ${({ $showLogo }) => ($showLogo ? "34px 32px 30px" : "30px 32px")};
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-shadow: 0 1px 2px 0 rgba(34, 36, 38, .12);

  @media (max-width: 480px) {
    padding: ${({ $showLogo }) => ($showLogo ? "24px 20px 22px" : "26px 20px 22px")};
  }
`;

const AuthHeader = styled.header`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  text-align: center;
`;

const AuthLogo = styled(Image)`
  width: min(260px, 100%);
  height: auto;
`;

const AuthTitle = styled.h1`
  margin: 0;
  color: #1f2937;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.2;
`;

export const AuthHelperText = styled.p`
  margin: -4px 0 0;
  color: #4b5563;
  font-size: 14px;
  line-height: 1.45;
  text-align: center;
`;

export const AuthSecondaryLink = styled.a`
  display: block;
  margin-top: 4px;
  text-align: center;
  color: #2185d0;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    text-decoration: underline;
  }
`;

const AuthLayout = ({
  title,
  helperText,
  children,
  maxWidth,
  variant = "public",
  showLogo = true,
}) => {
  const showHeader = showLogo || title || helperText;

  return (
    <AuthPage $variant={variant}>
      <AuthCard $maxWidth={maxWidth} $showLogo={showLogo}>
        {showHeader && (
          <AuthHeader>
            {showLogo && (
              <AuthLogo
                src="/accounts/callixto.png"
                alt="Logo Callixto.png"
                width={300}
                height={100}
                priority
                unoptimized
              />
            )}
            {title && <AuthTitle>{title}</AuthTitle>}
            {helperText && <AuthHelperText>{helperText}</AuthHelperText>}
          </AuthHeader>
        )}
        {children}
      </AuthCard>
    </AuthPage>
  );
};

export default AuthLayout;
