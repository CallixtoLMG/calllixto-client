'use client';
import { useUserContext } from "@/User";
import { IconedButton } from "@/common/components/buttons";
import { KeyboardShortcuts, ModalUpdates } from "@/common/components/modals";
import { COLORS, DEFAULT_SELECTED_CLIENT, ICONS, PAGES, getNavigationItems } from "@/common/constants";
import { useKeyboardShortcuts } from "@/hooks";
import { isCallixtoUser } from "@/roles";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { UserMenu } from "..";
import SidebarNavigation from "./Sidebar";
import {
  Brand,
  ClientBadge,
  HeaderBar,
  HeaderLeft,
  HeaderRight,
  Overlay,
  RightActions,
  UserButton
} from "./styles";

const Header = () => {
  const pathname = usePathname();
  const { push } = useRouter();
  const { userData, role } = useUserContext();
  const [selectedClientId, setSelectedClientId] = useState(DEFAULT_SELECTED_CLIENT);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const client = localStorage.getItem("selectedClientId") ?? DEFAULT_SELECTED_CLIENT;
      localStorage.setItem("selectedClientId", client);
      setSelectedClientId(client);
    }
  }, []);

  const navigationItems = useMemo(() => getNavigationItems(role), [role]);

  const handleClientChange = (client) => {
    localStorage.setItem("selectedClientId", client);
    setSelectedClientId(client);
    location.reload();
  };

  const handleLogout = () => {
    push(PAGES.LOGIN.BASE);
  };

  const routesWithoutHeader = [PAGES.LOGIN.BASE, PAGES.RESTORE_PASSWORD.BASE];
  const showHeader = !routesWithoutHeader.includes(pathname);

  const shortcutMapping = {
    [PAGES.CUSTOMERS.SHORTKEYS]: () => push(PAGES.CUSTOMERS.BASE),
    [PAGES.SUPPLIERS.SHORTKEYS]: () => push(PAGES.SUPPLIERS.BASE),
    [PAGES.BRANDS.SHORTKEYS]: () => push(PAGES.BRANDS.BASE),
    [PAGES.PRODUCTS.SHORTKEYS]: () => push(PAGES.PRODUCTS.BASE),
    [PAGES.BUDGETS.SHORTKEYS]: () => push(PAGES.BUDGETS.BASE),
    [PAGES.EXPENSES.SHORTKEYS]: () => push(PAGES.EXPENSES.BASE),
    [PAGES.USERS.SHORTKEYS]: () => push(PAGES.USERS.BASE),
    [PAGES.SETTINGS.SHORTKEYS]: () => push(PAGES.SETTINGS.BASE),
    [PAGES.CASH_BALANCES.SHORTKEYS]: () => push(PAGES.CASH_BALANCES.BASE),
  };

  useKeyboardShortcuts(shortcutMapping);

  if (!showHeader) return null;

  if (!userData?.isAuthorized) {
    return (
      <HeaderBar>
        <HeaderLeft>
          <Brand>CallixtoGLM</Brand>
        </HeaderLeft>
        <HeaderRight>
          <UserButton onClick={handleLogout}>Ingresar</UserButton>
        </HeaderRight>
      </HeaderBar>
    );
  }

  return (
    <>
      <HeaderBar>
        <HeaderLeft>
          <IconedButton
            onClick={() => setIsSidebarOpen(true)}
            icon={ICONS.LIST}
            color={COLORS.BLUE}
            text="Menú"
          />
          <Brand>CallixtoGLM</Brand>
        </HeaderLeft>

        <HeaderRight>
          <RightActions>
            <ModalUpdates />
            <KeyboardShortcuts />
          </RightActions>

          {isCallixtoUser(role) && (
            <ClientBadge>{selectedClientId}</ClientBadge>
          )}
          <UserMenu
            trigger={
              <IconedButton
                icon={ICONS.USER}
                color={COLORS.BLUE}
                text={userData.name}
                width="fit-content"

              />
            }
            onLogout={handleLogout}
            onClientChange={handleClientChange}
            userData={userData}
            selectedClient={selectedClientId}
          />
        </HeaderRight>
      </HeaderBar>
      <SidebarNavigation
        open={isSidebarOpen}
        pathname={pathname}
        items={navigationItems}
        onClose={() => setIsSidebarOpen(false)}
      />
      {isSidebarOpen && <Overlay onClick={() => setIsSidebarOpen(false)} />}
    </>
  );
};

export default Header;