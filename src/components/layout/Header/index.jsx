'use client';
import { useUserContext } from "@/User";
import { IconedButton } from "@/common/components/buttons";
import { KeyboardShortcuts, ModalUpdates } from "@/common/components/modals";
import { COLORS, ICONS, PAGES, getNavigationItems } from "@/common/constants";
import { useKeyboardShortcuts } from "@/hooks";
import { RULES, isCallixtoUser } from "@/roles";
import { getSelectedAccountId, setSelectedAccountId as saveSelectedAccountId } from "@/services/session";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { UserMenu } from "..";
import SidebarNavigation from "./Sidebar";
import {
  Brand,
  AccountBadge,
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
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !userData?.isAuthorized) return;

    const account = getSelectedAccountId(userData);

    if (isCallixtoUser(role)) {
      saveSelectedAccountId(account);
    }

    setSelectedAccountId(account);
  }, [role, userData]);

  const navigationItems = useMemo(() => getNavigationItems(role), [role]);

  const handleAccountChange = (account) => {
    saveSelectedAccountId(account);
    setSelectedAccountId(account);
    location.reload();
  };

  const handleLogout = () => {
    push(PAGES.LOGIN.BASE);
  };

  const routesWithoutHeader = [PAGES.LOGIN.BASE, PAGES.RESTORE_PASSWORD.BASE, PAGES.MAINTENANCE.BASE];
  const showHeader = !routesWithoutHeader.includes(pathname);

  const shortcutMapping = useMemo(() => ([
    {
      key: PAGES.CUSTOMERS.SHORTKEYS,
      action: () => push(PAGES.CUSTOMERS.BASE),
    },
    {
      key: PAGES.SUPPLIERS.SHORTKEYS,
      action: () => push(PAGES.SUPPLIERS.BASE),
    },
    {
      key: PAGES.BRANDS.SHORTKEYS,
      action: () => push(PAGES.BRANDS.BASE),
    },
    {
      key: PAGES.PRODUCTS.SHORTKEYS,
      action: () => push(PAGES.PRODUCTS.BASE),
    },
    {
      key: PAGES.BUDGETS.SHORTKEYS,
      action: () => push(PAGES.BUDGETS.BASE),
    },
    {
      key: PAGES.EXPENSES.SHORTKEYS,
      action: () => push(PAGES.EXPENSES.BASE),
    },
    {
      key: PAGES.CASH_BALANCES.SHORTKEYS,
      action: () => push(PAGES.CASH_BALANCES.BASE),
    },
    {
      key: PAGES.USERS.SHORTKEYS,
      action: () => push(PAGES.USERS.BASE),
      condition: () => RULES.canUpdate[role],
    },
    {
      key: PAGES.SETTINGS.SHORTKEYS,
      action: () => push(PAGES.SETTINGS.BASE),
      condition: () => RULES.canUpdate[role],
    },
  ]), [push, role]);

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
            <AccountBadge>{selectedAccountId}</AccountBadge>
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
            onAccountChange={handleAccountChange}
            userData={userData}
            selectedAccount={selectedAccountId}
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
