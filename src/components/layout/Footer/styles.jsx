import styled from "styled-components";

const FooterContainer = styled.footer`
  width: 100%;
  border-top: 1px solid #e7e7e7;
  background: rgb(243, 244, 246);
  color: #4b5563;
  padding: 10px 50px;
  box-sizing: border-box;
`;

const FooterBrand = styled.div`
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  text-align: center;

  @media (max-width: 600px) {
    min-height: 54px;
    flex-direction: column;
    gap: 5px;
  }
`;

const FooterLogoWrap = styled.div`
  width: 120px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;

  img {
    width: 100%;
    height: auto;
    max-height: 40px;
    object-fit: contain;
  }

  @media (max-width: 600px) {
    width: 104px;
    height: 34px;

    img {
      max-height: 34px;
    }
  }
`;

const FooterText = styled.p`
  margin: 0;
  font-size: 12.5px;
  line-height: 1.35;
  color: #4b5563;

  @media (max-width: 600px) {
    font-size: 11.5px;
  }
`;

export { FooterBrand, FooterContainer, FooterLogoWrap, FooterText };

