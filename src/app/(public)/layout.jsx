"use client";
import { LayoutChildrenContainer } from "../stylesLayout";

const PublicLayout = ({ children }) => (
  <LayoutChildrenContainer>
    {children}
  </LayoutChildrenContainer>
);

export default PublicLayout;
