"use client";
import Image from "next/image";
import { FooterBrand, FooterContainer, FooterLogoWrap, FooterText } from "./styles";

const Footer = () => {
  return (
    <FooterContainer>
      <FooterBrand>
        <FooterLogoWrap>
          <Image
            src="/branding/logo-callixtoglm.png"
            alt="CallixtoGLM"
            width={150}
            height={50}
            unoptimized
          />
        </FooterLogoWrap>
        <FooterText>© Copyright 2023 - Todos los derechos reservados por la empresa CallixtoGLM</FooterText>
      </FooterBrand>
    </FooterContainer>
  );
};

export default Footer;
