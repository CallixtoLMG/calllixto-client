"use client";
import { UserProvider } from "@/User";
import { RouteHistoryProvider } from "@/app/RouteHistoryContext";
import { BackToListButton, GoBackButton } from "@/common/components/buttons";
import { PAGES } from "@/common/constants";
import { BreadcrumProvider, Breadcrumb, Header, NavActions, NavActionsProvider } from "@/components/layout";
import { usePathname } from "next/navigation";
import styled from "styled-components";
import { LayoutChildrenContainer } from "../stylesLayout";

const NavigationContainer = styled.div`
  position: fixed;
  top: 60px;
  padding: 10px 50px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  column-gap: 20px;
  background-color: #fff;
  width: 100%;
  border-bottom: 1px solid #ddd;
  z-index: 3;
`;

const BreadcrumbContainer = styled.div`
  display: flex;
  align-items: center;
  column-gap: 10px;
`;

const PrivateLayout = ({ children }) => {
  const pathname = usePathname();
  const hide = [PAGES.BASE, PAGES.NOT_FOUND.BASE];
  const show = !hide.includes(pathname);

  return (
    <UserProvider>
      <RouteHistoryProvider>
        <Header />
        <NavActionsProvider>
          <BreadcrumProvider pathname={pathname}>
            {show && (
              <NavigationContainer>
                <BreadcrumbContainer>
                  <GoBackButton />
                  <BackToListButton />
                  <Breadcrumb />
                </BreadcrumbContainer>
                <NavActions />
              </NavigationContainer>
            )}
            <LayoutChildrenContainer>
              {children}
            </LayoutChildrenContainer>
          </BreadcrumProvider>
        </NavActionsProvider>
      </RouteHistoryProvider>
    </UserProvider>
  );
};

export default PrivateLayout;
